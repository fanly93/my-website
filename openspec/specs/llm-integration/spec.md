## Requirements

### Requirement: 后端提供流式 AI 回复端点

`POST /chat/sessions/{id}/messages/stream` SHALL 接受用户消息，从数据库读取 `is_active=True` 的 LLM 凭据（当前激活 Provider 的配置），将会话历史 + system prompt 传入 LLM，以 SSE 格式流式返回 AI 回复。流结束时将完整 AI 消息写入数据库。

#### Scenario: 流式请求成功

- **GIVEN** 会话存在且属于当前用户，用户已配置 LLM 凭据且 Provider 可用
- **WHEN** 调用流式端点并传入用户消息
- **THEN** 系统 SHALL 返回 `text/event-stream`，逐步推送 token，最后推送 `data: [DONE]`

#### Scenario: 用户未配置 LLM 凭据

- **GIVEN** 用户尚未配置任何 Provider 或所有 Provider 均未激活
- **WHEN** 调用流式端点
- **THEN** 系统 SHALL 返回 400，不发起 LLM 调用，不写入任何消息记录

#### Scenario: 请求体缺少消息内容

- **WHEN** 请求体中 content 为空字符串
- **THEN** 系统 SHALL 返回 422，不调用 LLM

#### Scenario: LLM Provider 调用失败

- **WHEN** LLM API 返回错误或超时（含模型名无效）
- **THEN** 系统 SHALL 推送 `data: [ERROR] <message>` 并关闭流，不写入不完整的 AI 消息

---

### Requirement: 支持多 LLM Provider，通过用户个人配置选择

系统 SHALL 支持 DeepSeek、DashScope、OpenAI 三类 Provider。Provider 凭据（api_key、base_url、model）由每位用户独立配置并存储于数据库，不依赖服务端环境变量。所有 Provider 使用统一的 OpenAI-compatible SDK 调用，仅切换 `base_url` 和 `api_key`。

#### Scenario: 使用用户个人配置发起 LLM 调用

- **GIVEN** 用户已在个人设置中配置 provider=deepseek、api_key、model
- **WHEN** 用户发送消息触发 LLM 调用
- **THEN** 系统 SHALL 使用该用户的 api_key 和 base_url 调用 DeepSeek API，不使用服务端全局凭据

#### Scenario: 用户未配置时拒绝调用

- **GIVEN** 用户尚未配置 LLM 凭据
- **WHEN** 用户尝试发送消息
- **THEN** 系统 SHALL 返回 400，提示用户先完成 LLM 配置，不发起任何 LLM API 调用

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
