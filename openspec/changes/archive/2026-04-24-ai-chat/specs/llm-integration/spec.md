## ADDED Requirements

### Requirement: 后端提供流式 AI 回复端点

`POST /chat/sessions/{id}/messages/stream` SHALL 接受用户消息，将会话历史 + system prompt 传入 LLM，以 SSE 格式流式返回 AI 回复。流结束时将完整 AI 消息写入数据库。

#### Scenario: 流式请求成功

- **GIVEN** 会话存在且属于当前用户，LLM Provider 可用
- **WHEN** 调用流式端点并传入用户消息
- **THEN** 系统 SHALL 返回 `text/event-stream`，逐步推送 token，最后推送 `data: [DONE]`

#### Scenario: 请求体缺少消息内容

- **WHEN** 请求体中 content 为空字符串
- **THEN** 系统 SHALL 返回 422，不调用 LLM

#### Scenario: LLM Provider 调用失败

- **WHEN** LLM API 返回错误或超时
- **THEN** 系统 SHALL 推送 `data: [ERROR] <message>` 并关闭流，不写入不完整的 AI 消息

---

### Requirement: 支持多 LLM Provider，通过环境变量配置

系统 SHALL 支持 DeepSeek、DashScope、OpenAI 三类 Provider，通过 `DEFAULT_PROVIDER` 环境变量选择活跃 Provider。所有 Provider 使用统一的 OpenAI-compatible SDK 调用，仅切换 `base_url` 和 `api_key`。

#### Scenario: 使用默认 Provider

- **GIVEN** `DEFAULT_PROVIDER=deepseek`
- **WHEN** 触发 LLM 调用
- **THEN** 系统 SHALL 使用 DeepSeek API endpoint 和对应 API Key

#### Scenario: Provider 配置缺失时启动失败

- **GIVEN** 活跃 Provider 对应的 API Key 环境变量未设置
- **WHEN** 后端服务启动
- **THEN** 系统 SHALL 抛出配置错误并拒绝启动

---

### Requirement: LLM 调用携带用户学习上下文

每次 LLM 调用 SHALL 包含 system prompt，其中注入用户的 level 和 streak_days 数据。system prompt SHALL 在会话创建时生成并存储，不在每次消息时重新查询用户数据。

#### Scenario: System prompt 注入用户数据

- **GIVEN** 用户 level=3，streak_days=7
- **WHEN** 创建新会话
- **THEN** 系统 SHALL 生成含「当前等级：Lv.3，连续学习天数：7 天」的 system prompt 并存储

#### Scenario: LLM 调用携带完整历史消息

- **GIVEN** 会话已有 4 条历史消息
- **WHEN** 用户发送第 5 条消息
- **THEN** 系统 SHALL 将 system prompt + 全部 4 条历史消息 + 新消息一并传入 LLM
