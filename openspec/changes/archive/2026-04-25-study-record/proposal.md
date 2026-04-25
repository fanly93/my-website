## Why

当前 Dashboard 所有数据来自前端 Mock，无法真实反映用户学习情况；日历、成就、今日目标、AI 推荐均缺乏持久化与真实数据支撑。需要新增独立的学习记录页面，并将核心模块升级为由 FastAPI 聚合的真实数据驱动。

## What Changes

- **新增** 学习记录页面（`/#/study-record`），集成学习日历、成就系统、统计数据、AI 对话建议和学习记录
- **新增** 学习日历组件：按日展示连续打卡与学习时长热力图
- **新增** 成就系统：基于里程碑自动解锁成就徽章，展示已获得与待解锁列表
- **升级** 今日目标：从 Mock 升级为后端 CRUD API（增删改查，真实持久化）
- **升级** AI 推荐学习：从静态 Mock 数据升级为实际调用 LLM 生成个性化建议
- **升级** 统计概览卡片：从 Mock 升级为 FastAPI 数据库聚合实时数据
- **升级** 问答历史：在学习记录页展示近期 AI 对话摘要（来自已有 chat_sessions 数据）

**Not doing（out-of-scope）：**
- 实时通知推送
- 数据导出（CSV / PDF）
- 多设备数据同步冲突处理
- 社交排行榜
- 打卡提醒 / 定时任务

## Capabilities

### New Capabilities
- `study-calendar`: 学习日历组件，展示每日打卡状态与学习时长热力图，支持月视图，数据来自后端 `/study/calendar`
- `achievement-system`: 成就系统，定义里程碑规则，后端自动判断解锁，前端展示成就墙
- `study-record-page`: 学习记录页面（`/#/study-record`），整合日历、成就、统计、AI 建议、问答摘要

### Modified Capabilities
- `daily-goals`: 从 localStorage + Mock 升级为后端 CRUD API（`/study/goals`），支持新增、编辑、删除、完成状态持久化
- `learning-suggestions`: 从静态 Mock 升级为调用用户已配置 LLM，生成个性化推荐；结果缓存 1 小时
- `stats-overview`: 从 Mock 升级为 FastAPI 聚合真实数据（连续天数、总学习天数、对话次数等）

## Impact

**后端：**
- 新增数据表：`study_logs`（每日打卡记录）、`achievements`（成就定义）、`user_achievements`（用户已解锁成就）、`daily_goals`（每日目标，替换 Mock）
- 新增路由：`/study/*`（日历、目标 CRUD、成就）、`/study/suggestions`（AI 推荐）、`/study/stats`（聚合统计）

**前端：**
- 新增页面：`src/pages/StudyRecordPage.tsx`
- 新增组件：`StudyCalendar.tsx`、`AchievementWall.tsx`、`StudyGoals.tsx`（升级）
- 路由：在 `App.tsx` 添加 `/#/study-record`
- 修改：`DashboardHome.tsx` 统计卡片和 AI 建议面板改用真实 API

**依赖：**
- 已有 `llm-integration`（LLM 调用能力复用用户配置）
- 已有 `chat-history`（问答摘要数据来源）
- 已有 `jwt-auth`（所有新端点需要认证）
