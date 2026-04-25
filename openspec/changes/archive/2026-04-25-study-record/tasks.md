## 1. 数据库迁移

- [x] 1.1 创建 Alembic migration：新增 `study_logs` 表（id、user_id、date DATE、duration_minutes INT、checked_in BOOL、created_at，unique: user_id+date）
- [x] 1.2 创建 Alembic migration：新增 `daily_goals` 表（id、user_id、title、estimated_minutes、completed BOOL、date DATE、created_at、updated_at，索引: user_id+date）
- [x] 1.3 创建 Alembic migration：新增 `user_achievements` 表（id、user_id、achievement_id VARCHAR、unlocked_at，unique: user_id+achievement_id）
- [x] 1.4 创建对应的 SQLAlchemy ORM 模型：`StudyLog`、`DailyGoal`、`UserAchievement`，加入 `backend/app/models/`

## 2. 后端 /study/* 路由基础

- [x] 2.1 创建 `backend/app/routers/study.py`，注册到 `main.py`（prefix="/study"）
- [x] 2.2 实现 `GET /study/stats`：聚合 total_study_days、total_chat_sessions、streak_days、completed_goals，新用户返回全零
- [x] 2.3 实现 streak_days 计算辅助函数：按 study_logs 倒序遍历，统计连续有打卡的天数

## 3. 学习日历后端

- [x] 3.1 实现 `GET /study/calendar?year=&month=`：返回当月每日 {date, duration_minutes, checked_in} 数组
- [x] 3.2 实现 `_upsert_study_log(db, user_id, duration_minutes)` 辅助函数：插入或累加当日打卡记录
- [x] 3.3 在 `chat.py` 流式写入 AI 消息完成后，调用 `_upsert_study_log`（+5 分钟/次）并触发成就检查

## 4. 今日目标后端 CRUD

- [x] 4.1 实现 `GET /study/goals?date=`：返回当日目标列表（过滤 user_id + date）
- [x] 4.2 实现 `POST /study/goals`：创建目标，title 必填，返回 201
- [x] 4.3 实现 `PUT /study/goals/{id}`：编辑目标文字和时长，仅允许本人操作，返回 200
- [x] 4.4 实现 `DELETE /study/goals/{id}`：删除目标，仅允许本人操作，返回 204
- [x] 4.5 实现 `PATCH /study/goals/{id}/complete`：切换完成状态，触发成就检查，返回 200

## 5. 成就系统后端

- [x] 5.1 在 `study.py` 中定义 5 个预设成就（hardcoded dict）：初学者、连续7天、连续30天、目标达人、对话达人
- [x] 5.2 实现 `GET /study/achievements`：返回所有成就 + 当前用户解锁状态（unlocked、unlocked_at）
- [x] 5.3 实现 `_check_and_unlock_achievements(db, user_id)` 异步函数：检查并写入新解锁成就（已解锁则跳过）
- [x] 5.4 在流式消息完成、目标完成、打卡更新后 fire-and-forget 调用成就检查

## 6. AI 建议后端

- [x] 6.1 实现 `GET /study/suggestions`：读取用户激活 LLM 配置，调用 LLM 生成建议，返回 suggestions 数组（title、category、estimated_minutes）
- [x] 6.2 构建建议 prompt：注入用户 level、streak_days、近 3 次会话标题，要求返回 JSON 格式
- [x] 6.3 实现内存 TTL 缓存（1 小时），key 为 user_id，命中时直接返回缓存结果
- [x] 6.4 LLM 调用失败时返回 502，未配置 LLM 时返回 400

## 7. 前端路由与页面骨架

- [x] 7.1 在 `App.tsx` 添加路由 `/#/study-record` → `StudyRecordPage`，要求已认证
- [x] 7.2 创建 `src/pages/StudyRecordPage.tsx`：包含六个区域的布局框架（stats、calendar、achievements、goals、ai-suggestions、qa-history），所有区域先渲染 loading skeleton

## 8. 前端 StudyCalendar 组件

- [x] 8.1 创建 `src/components/study/StudyCalendar.tsx`：月视图网格，调用 `GET /study/calendar`
- [x] 8.2 实现热力图着色逻辑：按 duration_minutes 分 4 档（0/1-30/31-60/60+），暗色模式适配
- [x] 8.3 支持月份切换（上月/下月按钮），切换时重新请求数据
- [x] 8.4 未来日期格显示为空，悬停日期格显示 tooltip（日期 + 学习时长）

## 9. 前端成就墙组件

- [x] 9.1 创建 `src/components/study/AchievementWall.tsx`：调用 `GET /study/achievements`，渲染成就网格
- [x] 9.2 已解锁成就彩色显示，未解锁灰色锁定图标
- [x] 9.3 悬停显示 tooltip：成就名称 + 解锁条件 + 已解锁时间（若已解锁）

## 10. 前端今日目标组件（升级）

- [x] 10.1 创建 `src/components/study/StudyGoals.tsx`：调用 `GET /study/goals?date=<today>`，渲染目标列表
- [x] 10.2 实现新增目标 UI：输入框 + 确认按钮，调用 `POST /study/goals`
- [x] 10.3 实现编辑目标：点击目标文字进入内联编辑，确认后调用 `PUT /study/goals/{id}`
- [x] 10.4 实现删除目标：每条目标右侧删除图标，调用 `DELETE /study/goals/{id}`
- [x] 10.5 实现完成状态切换：复选框点击调用 `PATCH /study/goals/{id}/complete`，乐观更新 UI

## 11. 前端 AI 建议面板升级

- [x] 11.1 升级 Dashboard 的 LearningSuggestions 组件（或在 StudyRecordPage 中新建 `AISuggestions.tsx`）：调用 `GET /study/suggestions`
- [x] 11.2 未配置 LLM 时展示引导文字「请先在 AI Chat 页配置 API Key」，含跳转链接
- [x] 11.3 加载中显示 skeleton，失败显示错误提示及重试按钮

## 12. 前端统计卡片升级

- [x] 12.1 Dashboard `StatsOverview` 组件改为调用 `GET /study/stats`，删除 Mock 数据引用
- [x] 12.2 统计字段映射：total_study_days / total_chat_sessions / streak_days / completed_goals → 四张卡片

## 13. 前端问答历史组件升级

- [x] 13.1 创建 `src/components/study/QAHistory.tsx`（或升级现有组件）：调用 `GET /chat/sessions`，展示最近 10 条
- [x] 13.2 点击条目跳转 `/#/ai-chat` 并切换至对应会话
- [x] 13.3 空状态显示引导「还没有对话记录，去 AI Chat 开始学习」

## 14. 收尾

- [x] 14.1 测试端到端流程：发送 AI 消息 → 打卡记录更新 → stats 变化 → 成就解锁
- [x] 14.2 验证 Dashboard 四张统计卡片显示真实数据
- [x] 14.3 验证 streak_days 跨日计算正确
