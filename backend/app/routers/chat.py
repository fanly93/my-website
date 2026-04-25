import json
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal, get_db
from app.dependencies import get_current_user
from app.models.chat import ChatMessage, ChatSession
from app.models.user import User
from app.models.user_llm_config import UserLLMConfig
from app.schemas.chat import ChatMessageResponse, ChatSessionResponse, SendMessageRequest
from app.services.llm import stream_chat
from app.routers.study import _check_and_unlock_achievements, _upsert_study_log

router = APIRouter(prefix="/chat", tags=["chat"])


def _build_system_prompt(user: User) -> str:
    return (
        f"你是用户的 AI 学习助手。用户信息如下：\n"
        f"- 当前等级：Lv.{user.level}\n"
        f"- 连续学习天数：{user.streak_days} 天\n"
        "请结合用户的学习进度，给出个性化、有针对性的建议。"
    )


@router.post("/sessions", response_model=ChatSessionResponse, status_code=201)
async def create_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    system_prompt = _build_system_prompt(current_user)
    session = ChatSession(user_id=current_user.id, system_prompt=system_prompt)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/sessions", response_model=list[ChatSessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .limit(20)
    )
    return result.scalars().all()


@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageResponse])
async def get_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await _get_owned_session(db, session_id, current_user.id)
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.asc())
    )
    return result.scalars().all()


@router.post("/sessions/{session_id}/messages/stream")
async def stream_message(
    session_id: str,
    body: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not body.content.strip():
        raise HTTPException(status_code=422, detail="消息内容不得为空")

    # Require user to have configured their own LLM credentials
    cfg_result = await db.execute(
        select(UserLLMConfig).where(
            UserLLMConfig.user_id == current_user.id,
            UserLLMConfig.is_active == True,  # noqa: E712
        )
    )
    llm_cfg = cfg_result.scalar_one_or_none()
    if not llm_cfg:
        raise HTTPException(status_code=400, detail="请先在设置中配置 LLM API Key")

    credentials = {
        "api_key": llm_cfg.api_key,
        "base_url": llm_cfg.base_url,
        "model": llm_cfg.model,
    }

    session = await _get_owned_session(db, session_id, current_user.id)

    # Persist user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=body.content)
    db.add(user_msg)
    await db.commit()

    # Query all messages ordered in DB
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.asc())
    )
    all_msgs = result.scalars().all()

    # Update session title on first user message
    user_msgs = [m for m in all_msgs if m.role == "user"]
    if len(user_msgs) == 1 and session.title == "新对话":
        session.title = body.content[:20]
        await db.commit()

    history = [{"role": m.role, "content": m.content} for m in all_msgs]

    return StreamingResponse(
        _sse_generator(session.id, session.system_prompt, history, credentials, current_user.id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await _get_owned_session(db, session_id, current_user.id)
    await db.execute(delete(ChatMessage).where(ChatMessage.session_id == session.id))
    await db.delete(session)
    await db.commit()


# ── helpers ───────────────────────────────────────────────────────────────────

async def _get_owned_session(db: AsyncSession, session_id: str, user_id: str) -> ChatSession:
    result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    return session


async def _sse_generator(
    session_id: str,
    system_prompt: str,
    history: list[dict],
    credentials: dict,
    user_id: str,
) -> AsyncGenerator[str, None]:
    collected: list[str] = []
    try:
        async for token in stream_chat(history, system_prompt, credentials):
            collected.append(token)
            yield f"data: {json.dumps(token, ensure_ascii=False)}\n\n"
    except Exception as exc:
        yield f"data: [ERROR] {exc}\n\n"
        return

    full_content = "".join(collected)
    if full_content:
        try:
            async with AsyncSessionLocal() as db:
                ai_msg = ChatMessage(session_id=session_id, role="assistant", content=full_content)
                db.add(ai_msg)
                await db.commit()
            # Record study log and check achievements (fire-and-forget)
            async with AsyncSessionLocal() as db:
                await _upsert_study_log(db, user_id, duration_minutes=5)
                await _check_and_unlock_achievements(db, user_id)
        except Exception:
            pass

    yield "data: [DONE]\n\n"
