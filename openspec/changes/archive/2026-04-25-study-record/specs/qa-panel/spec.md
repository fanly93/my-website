## MODIFIED Requirements

### Requirement: 展示历史问答记录面板

系统 SHALL 在学习记录页展示问答历史列表（最多 10 条），数据来自后端 `GET /chat/sessions`（真实对话记录），展示会话标题、创建时间，不再使用 Mock 数据。不再显示「回答摘要」字段（由会话标题替代）。

#### Scenario: 加载时展示问答列表

- **GIVEN** 用户已认证且有 AI 对话记录
- **WHEN** 访问学习记录页
- **THEN** 系统 SHALL 调用 `GET /chat/sessions`，渲染最近 10 条会话的标题和相对时间

#### Scenario: 时间显示为相对时间

- **WHEN** 渲染问答记录
- **THEN** 时间字段 SHALL 以相对格式显示（如「3 小时前」「昨天」），不显示原始时间戳

#### Scenario: 点击条目跳转 AI Chat

- **WHEN** 用户点击某条问答历史条目
- **THEN** 系统 SHALL 跳转至 `/#/ai-chat` 并切换至对应会话

#### Scenario: 问答列表为空时展示空状态

- **WHEN** 用户无任何对话记录
- **THEN** 系统 SHALL 显示空状态提示「还没有对话记录，去 AI Chat 开始学习」，含跳转链接
