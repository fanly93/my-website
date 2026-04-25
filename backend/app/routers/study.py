import asyncio
import json
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal, get_db
from app.dependencies import get_current_user
from app.models.chat import ChatSession
from app.models.study import DailyGoal, StudyLog, UserAchievement
from app.models.user import User
from app.models.user_llm_config import UserLLMConfig
from app.services.llm import stream_chat

router = APIRouter(prefix="/study", tags=["study"])

# ── In-memory suggestion cache: {user_id: (expires_at, suggestions)} ──────────
_suggestion_cache: dict[str, tuple[datetime, list[dict]]] = {}

# ── Achievement definitions ────────────────────────────────────────────────────
ACHIEVEMENTS: list[dict] = [
    {
        "id": "first_chat",
        "name": "初学者",
        "description": "完成第 1 次 AI 对话",
        "icon": "🎯",
    },
    {
        "id": "streak_7",
        "name": "连续学习 7 天",
        "description": "连续打卡学习满 7 天",
        "icon": "🔥",
    },
    {
        "id": "streak_30",
        "name": "连续学习 30 天",
        "description": "连续打卡学习满 30 天",
        "icon": "💎",
    },
    {
        "id": "goals_10",
        "name": "目标达人",
        "description": "累计完成学习目标 10 个",
        "icon": "⭐",
    },
    {
        "id": "chats_50",
        "name": "对话达人",
        "description": "累计完成 AI 对话 50 次",
        "icon": "🏆",
    },
]


# ── Schemas ───────────────────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    total_study_days: int
    total_chat_sessions: int
    streak_days: int
    completed_goals: int


class CalendarDay(BaseModel):
    date: str  # ISO format YYYY-MM-DD
    duration_minutes: int
    checked_in: bool


class GoalResponse(BaseModel):
    id: str
    title: str
    estimated_minutes: int
    completed: bool
    date: str
    created_at: datetime

    model_config = {"from_attributes": True}


class GoalCreate(BaseModel):
    title: str
    estimated_minutes: int = 0


class GoalUpdate(BaseModel):
    title: str | None = None
    estimated_minutes: int | None = None


class CompleteRequest(BaseModel):
    completed: bool


class AchievementResponse(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    unlocked: bool
    unlocked_at: datetime | None


class SuggestionItem(BaseModel):
    title: str
    category: str
    estimated_minutes: int


class SuggestionsResponse(BaseModel):
    suggestions: list[SuggestionItem]


class TrendPoint(BaseModel):
    date: str  # YYYY-MM-DD
    studyMinutes: int
    completedCount: int


# ── Helpers ───────────────────────────────────────────────────────────────────

def _today_utc() -> date:
    return datetime.now(timezone.utc).date()


async def _compute_streak(db: AsyncSession, user_id: str) -> int:
    result = await db.execute(
        select(StudyLog.date)
        .where(StudyLog.user_id == user_id, StudyLog.checked_in == True)  # noqa: E712
        .order_by(StudyLog.date.desc())
    )
    dates: list[date] = list(result.scalars().all())
    if not dates:
        return 0

    today = _today_utc()
    yesterday = today - timedelta(days=1)

    # streak starts from today or yesterday
    if dates[0] != today and dates[0] != yesterday:
        return 0

    streak = 1
    for i in range(1, len(dates)):
        if dates[i - 1] - dates[i] == timedelta(days=1):
            streak += 1
        else:
            break
    return streak


async def _upsert_study_log(db: AsyncSession, user_id: str, duration_minutes: int = 5) -> None:
    today = _today_utc()
    result = await db.execute(
        select(StudyLog).where(StudyLog.user_id == user_id, StudyLog.date == today)
    )
    log = result.scalar_one_or_none()
    if log:
        log.duration_minutes += duration_minutes
        log.checked_in = True
    else:
        log = StudyLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            date=today,
            duration_minutes=duration_minutes,
            checked_in=True,
        )
        db.add(log)
    await db.commit()


async def _check_and_unlock_achievements(db: AsyncSession, user_id: str) -> None:
    try:
        # Load already-unlocked achievement IDs
        result = await db.execute(
            select(UserAchievement.achievement_id).where(UserAchievement.user_id == user_id)
        )
        unlocked_ids: set[str] = set(result.scalars().all())

        to_unlock: list[str] = []

        # first_chat: at least one chat session
        if "first_chat" not in unlocked_ids:
            count = await db.scalar(
                select(func.count()).select_from(ChatSession).where(ChatSession.user_id == user_id)
            )
            if (count or 0) >= 1:
                to_unlock.append("first_chat")

        # streak_7 / streak_30
        streak = await _compute_streak(db, user_id)
        if "streak_7" not in unlocked_ids and streak >= 7:
            to_unlock.append("streak_7")
        if "streak_30" not in unlocked_ids and streak >= 30:
            to_unlock.append("streak_30")

        # goals_10: completed goals count
        if "goals_10" not in unlocked_ids:
            count = await db.scalar(
                select(func.count()).select_from(DailyGoal).where(
                    DailyGoal.user_id == user_id, DailyGoal.completed == True  # noqa: E712
                )
            )
            if (count or 0) >= 10:
                to_unlock.append("goals_10")

        # chats_50: count of chat messages sent by user
        if "chats_50" not in unlocked_ids:
            from app.models.chat import ChatMessage
            count = await db.scalar(
                select(func.count()).select_from(ChatMessage)
                .join(ChatSession, ChatMessage.session_id == ChatSession.id)
                .where(ChatSession.user_id == user_id, ChatMessage.role == "user")
            )
            if (count or 0) >= 50:
                to_unlock.append("chats_50")

        now = datetime.now(timezone.utc)
        for ach_id in to_unlock:
            db.add(UserAchievement(
                id=str(uuid.uuid4()),
                user_id=user_id,
                achievement_id=ach_id,
                unlocked_at=now,
            ))
        if to_unlock:
            await db.commit()
    except Exception:
        pass  # fire-and-forget, never block the caller


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total_study_days = await db.scalar(
        select(func.count()).select_from(StudyLog)
        .where(StudyLog.user_id == current_user.id, StudyLog.checked_in == True)  # noqa: E712
    ) or 0

    total_chat_sessions = await db.scalar(
        select(func.count()).select_from(ChatSession)
        .where(ChatSession.user_id == current_user.id)
    ) or 0

    streak = await _compute_streak(db, current_user.id)

    completed_goals = await db.scalar(
        select(func.count()).select_from(DailyGoal)
        .where(DailyGoal.user_id == current_user.id, DailyGoal.completed == True)  # noqa: E712
    ) or 0

    return StatsResponse(
        total_study_days=total_study_days,
        total_chat_sessions=total_chat_sessions,
        streak_days=streak,
        completed_goals=completed_goals,
    )


@router.get("/calendar", response_model=list[CalendarDay])
async def get_calendar(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import calendar
    _, days_in_month = calendar.monthrange(year, month)
    start = date(year, month, 1)
    end = date(year, month, days_in_month)

    result = await db.execute(
        select(StudyLog).where(
            StudyLog.user_id == current_user.id,
            StudyLog.date >= start,
            StudyLog.date <= end,
        )
    )
    logs_by_date: dict[date, StudyLog] = {log.date: log for log in result.scalars().all()}

    today = _today_utc()
    days = []
    for day_num in range(1, days_in_month + 1):
        d = date(year, month, day_num)
        if d > today:
            days.append(CalendarDay(date=d.isoformat(), duration_minutes=0, checked_in=False))
        elif d in logs_by_date:
            log = logs_by_date[d]
            days.append(CalendarDay(date=d.isoformat(), duration_minutes=log.duration_minutes, checked_in=log.checked_in))
        else:
            days.append(CalendarDay(date=d.isoformat(), duration_minutes=0, checked_in=False))
    return days


@router.get("/goals", response_model=list[GoalResponse])
async def list_goals(
    date_str: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target_date = date.fromisoformat(date_str) if date_str else _today_utc()
    result = await db.execute(
        select(DailyGoal)
        .where(DailyGoal.user_id == current_user.id, DailyGoal.date == target_date)
        .order_by(DailyGoal.created_at.asc())
    )
    goals = result.scalars().all()
    return [
        GoalResponse(
            id=g.id,
            title=g.title,
            estimated_minutes=g.estimated_minutes,
            completed=g.completed,
            date=g.date.isoformat(),
            created_at=g.created_at,
        )
        for g in goals
    ]


@router.post("/goals", response_model=GoalResponse, status_code=201)
async def create_goal(
    body: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not body.title.strip():
        raise HTTPException(status_code=422, detail="目标文字不得为空")
    now = datetime.now(timezone.utc)
    goal = DailyGoal(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=body.title.strip(),
        estimated_minutes=body.estimated_minutes,
        date=_today_utc(),
        created_at=now,
        updated_at=now,
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return GoalResponse(
        id=goal.id,
        title=goal.title,
        estimated_minutes=goal.estimated_minutes,
        completed=goal.completed,
        date=goal.date.isoformat(),
        created_at=goal.created_at,
    )


@router.put("/goals/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: str,
    body: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    goal = await _get_owned_goal(db, goal_id, current_user.id)
    if body.title is not None:
        if not body.title.strip():
            raise HTTPException(status_code=422, detail="目标文字不得为空")
        goal.title = body.title.strip()
    if body.estimated_minutes is not None:
        goal.estimated_minutes = body.estimated_minutes
    goal.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(goal)
    return GoalResponse(
        id=goal.id,
        title=goal.title,
        estimated_minutes=goal.estimated_minutes,
        completed=goal.completed,
        date=goal.date.isoformat(),
        created_at=goal.created_at,
    )


@router.delete("/goals/{goal_id}", status_code=204)
async def delete_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    goal = await _get_owned_goal(db, goal_id, current_user.id)
    await db.delete(goal)
    await db.commit()


@router.patch("/goals/{goal_id}/complete", response_model=GoalResponse)
async def toggle_goal_complete(
    goal_id: str,
    body: CompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    goal = await _get_owned_goal(db, goal_id, current_user.id)
    goal.completed = body.completed
    goal.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(goal)
    if body.completed:
        asyncio.ensure_future(_run_achievement_check_bg(current_user.id))
    return GoalResponse(
        id=goal.id,
        title=goal.title,
        estimated_minutes=goal.estimated_minutes,
        completed=goal.completed,
        date=goal.date.isoformat(),
        created_at=goal.created_at,
    )


@router.get("/achievements", response_model=list[AchievementResponse])
async def get_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == current_user.id)
    )
    unlocked: dict[str, UserAchievement] = {ua.achievement_id: ua for ua in result.scalars().all()}

    return [
        AchievementResponse(
            id=ach["id"],
            name=ach["name"],
            description=ach["description"],
            icon=ach["icon"],
            unlocked=ach["id"] in unlocked,
            unlocked_at=unlocked[ach["id"]].unlocked_at if ach["id"] in unlocked else None,
        )
        for ach in ACHIEVEMENTS
    ]


@router.get("/suggestions", response_model=SuggestionsResponse)
async def get_suggestions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check cache (1-hour TTL)
    now = datetime.now(timezone.utc)
    cached = _suggestion_cache.get(current_user.id)
    if cached and cached[0] > now:
        return SuggestionsResponse(suggestions=[SuggestionItem(**s) for s in cached[1]])

    # Require LLM config
    cfg_result = await db.execute(
        select(UserLLMConfig).where(
            UserLLMConfig.user_id == current_user.id,
            UserLLMConfig.is_active == True,  # noqa: E712
        )
    )
    llm_cfg = cfg_result.scalar_one_or_none()
    if not llm_cfg:
        raise HTTPException(status_code=400, detail="请先在 AI Chat 页配置 API Key")

    # Get context: streak, level, recent session titles
    streak = await _compute_streak(db, current_user.id)
    recent_sessions_result = await db.execute(
        select(ChatSession.title)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .limit(3)
    )
    recent_titles = list(recent_sessions_result.scalars().all())

    prompt = _build_suggestion_prompt(
        level=current_user.level,
        streak_days=streak,
        recent_titles=recent_titles,
    )

    credentials = {
        "api_key": llm_cfg.api_key,
        "base_url": llm_cfg.base_url,
        "model": llm_cfg.model,
    }

    # Collect full LLM response (non-streaming parse)
    collected: list[str] = []
    try:
        async for token in stream_chat(
            [{"role": "user", "content": prompt}],
            "",
            credentials,
        ):
            collected.append(token)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"建议生成失败：{exc}") from exc

    raw = "".join(collected)
    suggestions = _parse_suggestions(raw)

    # Store in cache
    expires_at = now + timedelta(hours=1)
    _suggestion_cache[current_user.id] = (expires_at, [s.model_dump() for s in suggestions])

    return SuggestionsResponse(suggestions=suggestions)


@router.get("/trends", response_model=list[TrendPoint])
async def get_trends(
    period: str = "week",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    days = 7 if period == "week" else 30
    today = _today_utc()
    start = today - timedelta(days=days - 1)

    # Fetch study logs in range
    logs_result = await db.execute(
        select(StudyLog).where(
            StudyLog.user_id == current_user.id,
            StudyLog.date >= start,
            StudyLog.date <= today,
        )
    )
    logs_by_date: dict[date, int] = {
        log.date: log.duration_minutes for log in logs_result.scalars().all()
    }

    # Fetch completed goals grouped by date in range
    goals_result = await db.execute(
        select(DailyGoal).where(
            DailyGoal.user_id == current_user.id,
            DailyGoal.date >= start,
            DailyGoal.date <= today,
            DailyGoal.completed == True,  # noqa: E712
        )
    )
    goals_by_date: dict[date, int] = {}
    for goal in goals_result.scalars().all():
        goals_by_date[goal.date] = goals_by_date.get(goal.date, 0) + 1

    points = []
    for i in range(days):
        d = start + timedelta(days=i)
        points.append(TrendPoint(
            date=d.isoformat(),
            studyMinutes=logs_by_date.get(d, 0),
            completedCount=goals_by_date.get(d, 0),
        ))
    return points


# ── Private helpers ───────────────────────────────────────────────────────────

async def _run_achievement_check_bg(user_id: str) -> None:
    async with AsyncSessionLocal() as bg_db:
        await _check_and_unlock_achievements(bg_db, user_id)


async def _get_owned_goal(db: AsyncSession, goal_id: str, user_id: str) -> DailyGoal:
    result = await db.execute(
        select(DailyGoal).where(DailyGoal.id == goal_id, DailyGoal.user_id == user_id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="目标不存在")
    return goal


def _build_suggestion_prompt(level: int, streak_days: int, recent_titles: list[str]) -> str:
    titles_text = "\n".join(f"- {t}" for t in recent_titles) if recent_titles else "- （暂无记录）"
    return (
        f"你是一名 AI 学习顾问。请根据以下学习者信息，生成 5 条个性化学习建议。\n\n"
        f"学习者信息：\n"
        f"- 当前等级：Lv.{level}\n"
        f"- 连续学习天数：{streak_days} 天\n"
        f"- 近期对话主题：\n{titles_text}\n\n"
        f"请以 JSON 数组格式返回，每项包含以下字段（不要输出其他内容）：\n"
        f'[{{"title": "建议标题", "category": "分类标签", "estimated_minutes": 预计时长(整数)}}]\n'
        f"分类标签示例：RAG、Agent、Prompt Engineering、Python、LLM 原理、实战项目"
    )


def _parse_suggestions(raw: str) -> list[SuggestionItem]:
    try:
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start == -1 or end == 0:
            return []
        data = json.loads(raw[start:end])
        results = []
        for item in data[:5]:
            results.append(SuggestionItem(
                title=str(item.get("title", "")),
                category=str(item.get("category", "其他")),
                estimated_minutes=int(item.get("estimated_minutes", 30)),
            ))
        return results
    except Exception:
        return []
