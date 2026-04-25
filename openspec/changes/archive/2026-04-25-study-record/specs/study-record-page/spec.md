## ADDED Requirements

### Requirement: 学习记录页面路由与布局

系统 SHALL 在 `/#/study-record` 渲染学习记录页，页面包含：顶部统计卡片、学习日历、成就墙、今日目标、AI 推荐学习、近期问答摘要六个区域，布局响应式，支持亮/暗色模式。

#### Scenario: 访问学习记录页

- **GIVEN** 用户已认证
- **WHEN** 访问 `/#/study-record`
- **THEN** 系统 SHALL 渲染完整学习记录页，所有数据区域显示加载状态后填充真实数据

#### Scenario: 未认证时重定向

- **GIVEN** 用户未登录
- **WHEN** 访问 `/#/study-record`
- **THEN** 系统 SHALL 重定向至登录页，不渲染页面内容

#### Scenario: 暗色模式正确渲染

- **WHEN** 用户切换至暗色模式
- **THEN** 页面所有区域 SHALL 切换深色配色，保持可读性

---

### Requirement: 近期问答摘要展示

系统 SHALL 在学习记录页展示近期 AI 对话摘要列表（最多 10 条），数据来自已有 `chat_sessions` + `chat_messages` 数据，展示会话标题、首条用户消息摘要、创建时间。

#### Scenario: 加载近期问答摘要

- **GIVEN** 用户已有 AI 对话记录
- **WHEN** 访问学习记录页
- **THEN** 系统 SHALL 调用 `GET /chat/sessions`（最近 10 条），展示每条会话的标题和时间

#### Scenario: 点击摘要跳转对话

- **WHEN** 用户点击某条问答摘要
- **THEN** 系统 SHALL 跳转至 `/#/ai-chat` 并切换到对应会话

#### Scenario: 无对话记录时显示引导

- **GIVEN** 用户尚未开始任何 AI 对话
- **WHEN** 渲染问答摘要区域
- **THEN** 系统 SHALL 显示「还没有对话记录，去 AI Chat 开始学习」引导，含跳转链接
