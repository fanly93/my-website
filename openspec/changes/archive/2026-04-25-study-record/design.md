## Context

当前 Dashboard 所有数据来自前端 Mock（`src/data/dashboard.ts`），无真实持久化。后端已具备 FastAPI + SQLite + JWT 认证 + AI 对话能力（`chat_sessions` / `chat_messages` / `user_llm_configs`）。本次变更在现有后端基础上新增学习记录模块，将 Mock 数据迁移至真实 API，并新增学习记录专属页面。

## Goals / Non-Goals

**Goals:**
- 新建 `/study/*` 路由族，覆盖统计、日历、目标 CRUD、成就、AI 建议
- 新增 `study_logs`、`daily_goals`、`user_achievements` 三张表
- 新增学习记录页面 `/#/study-record`
- Dashboard 统计卡片、AI 建议面板从 Mock 切换至真实 API

**Non-Goals:**
- 实时通知、数据导出、社交排行榜（proposal 已排除）
- 修改 AI Chat 核心流式对话逻辑
- 推倒重来现有 Dashboard 布局

## Decisions

### Decision 1：数据表设计

**study_logs**（每日打卡记录）
```
id, user_id, date (DATE UNIQUE per user), duration_minutes INT, checked_in BOOL, created_at
unique: (user_id, date)
```

**daily_goals**（今日目标，替代 localStorage）
```
id, user_id, title, estimated_minutes INT, completed BOOL, date DATE, created_at, updated_at
索引: (user_id, date)
```

**user_achievements**（用户已解锁成就）
```
id, user_id, achievement_id (VARCHAR), unlocked_at
unique: (user_id, achievement_id)
成就定义 hardcoded 于后端，不入库
```

理由：成就定义固定（5 个预设），hardcoded 避免运行时迁移复杂度；`daily_goals` 按日存储支持历史查询。

### Decision 2：API 路由结构

所有新端点归于 `/study` 前缀，独立 router 文件 `backend/app/routers/study.py`：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /study/stats | 聚合统计（学习天数、对话次数、连续天数、完成目标数） |
| GET | /study/calendar | 当月打卡日历（?year=&month=） |
| GET | /study/goals | 当日目标列表（?date_str=） |
| POST | /study/goals | 创建目标 |
| PUT | /study/goals/{id} | 编辑目标 |
| DELETE | /study/goals/{id} | 删除目标 |
| PATCH | /study/goals/{id}/complete | 切换完成状态 |
| GET | /study/achievements | 所有成就 + 用户解锁状态 |
| GET | /study/suggestions | AI 个性化建议（带 1 小时缓存） |

### Decision 3：打卡记录自动触发机制

用户每次完成 AI 消息流时，在 `chat.py` 流式写入完成后追加调用 `_upsert_study_log(user_id, duration_minutes=5)`（固定 5 分钟/次）。不引入独立的打卡 API，避免用户手动操作负担。

理由：对话即学习，自动打卡对用户体验友好；固定时长简化实现，后续可按消息字数动态计算。

### Decision 4：成就检查时机

在以下写操作后异步（fire-and-forget）触发成就检查函数 `_check_and_unlock_achievements(db, user_id)`：
- 流式消息写入完成
- `PATCH /study/goals/{id}/complete`（completed=true）
- `_upsert_study_log` 写入后

不阻塞主请求返回，检查失败静默处理。

### Decision 5：AI 建议缓存方案

使用内存字典 `{user_id: (timestamp, suggestions_list)}` 实现 1 小时 TTL 缓存（不依赖 Redis）。理由：单实例部署，进程重启清空缓存可接受；避免引入新依赖。

### Decision 6：前端页面结构

新增 `src/pages/StudyRecordPage.tsx`，组件拆分：
- `StudyCalendar.tsx`：月视图热力图日历
- `AchievementWall.tsx`：成就墙
- `StudyGoals.tsx`：目标列表（复用并升级现有 DailyGoals 组件逻辑）
- `AISuggestions.tsx`：AI 建议面板（升级）
- `QAHistory.tsx`：问答摘要（升级）

Dashboard 首页的统计卡片 (`StatsOverview`) 和 AI 建议 (`LearningSuggestions`) 直接改为调用真实 API，不新增组件文件。

### Decision 7：stats_overview streak_days 计算

streak_days 计算逻辑：从今日（或昨日，若今日无记录）向前遍历 `study_logs`，统计连续有 `checked_in=True` 的天数。SQL 实现：按 date 倒序取 study_logs，在 Python 中逐日判断连续性。

## Risks / Trade-offs

- **LLM 建议延迟**：AI 建议首次调用可能耗时 3-10 秒 → 缓存 + 前端 loading skeleton
- **streak_days 时区问题**：服务器与用户时区不一致可能导致跨日计算偏差 → 使用 UTC 存储，前端展示转换
- **内存缓存丢失**：服务重启建议缓存清空，用户需重新获取 → 可接受（建议不是强依赖数据）
- **固定 5 分钟/次学习时长**：不精确 → 后期可按消息数/字数动态计算，当前版本简化实现

## Migration Plan

1. 新增 Alembic migration：创建 `study_logs`、`daily_goals`、`user_achievements` 三表
2. 注册新 router：`app.include_router(study.router, prefix="/study", tags=["study"])`
3. `chat.py` 流式写入完成后追加 study_log upsert 逻辑
4. 前端新增路由 `/#/study-record` 及组件
5. Dashboard 统计卡片、AI 建议改为调用真实 API（Mock 数据文件保留但不再引用）
6. 无需数据迁移（新表均为空表启动）

**回滚：** 删除新路由注册、恢复 Mock 数据引用，无 DB 破坏性变更（新表仅新增）。

## Open Questions

- 学习日历的打卡时长是否应支持手动记录（当前仅自动追踪 AI 对话）？→ 暂定：仅自动追踪，后续迭代
- streak_days 是否应在用户每日首次登录时检查（而非仅对话时）？→ 暂定：对话触发，避免轮询
