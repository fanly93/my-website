## ADDED Requirements

### Requirement: 系统持久化对话会话与消息

系统 SHALL 将每个用户的对话会话存储到 `chat_sessions` 表，将每条消息（用户和 AI）存储到 `chat_messages` 表。每个会话 SHALL 归属于创建它的用户，不同用户的会话 SHALL 隔离。

#### Scenario: 创建新会话

- **GIVEN** 用户已认证
- **WHEN** 调用 `POST /chat/sessions`
- **THEN** 系统 SHALL 返回 201 及新会话对象（含 id、title、created_at）

#### Scenario: 获取会话列表

- **GIVEN** 用户已认证
- **WHEN** 调用 `GET /chat/sessions`
- **THEN** 系统 SHALL 返回当前用户的会话列表，按 created_at 倒序排列，最多返回 20 条

#### Scenario: 跨用户隔离

- **GIVEN** 用户 A 和用户 B 各有自己的会话
- **WHEN** 用户 A 调用 `GET /chat/sessions`
- **THEN** 系统 SHALL 仅返回用户 A 的会话，不含用户 B 的数据

---

### Requirement: 系统存储并可检索历史消息

`GET /chat/sessions/{id}/messages` SHALL 返回指定会话的完整消息历史，按时间正序排列。AI 消息 SHALL 在流式完成后整体写入，不逐 token 写入。

#### Scenario: 获取历史消息

- **GIVEN** 会话存在且属于当前用户
- **WHEN** 调用 `GET /chat/sessions/{id}/messages`
- **THEN** 系统 SHALL 返回 200 及消息列表（含 role、content、created_at）

#### Scenario: 访问他人会话被拒绝

- **GIVEN** 会话 id 属于其他用户
- **WHEN** 当前用户调用 `GET /chat/sessions/{id}/messages`
- **THEN** 系统 SHALL 返回 404

#### Scenario: 删除会话

- **GIVEN** 会话属于当前用户
- **WHEN** 调用 `DELETE /chat/sessions/{id}`
- **THEN** 系统 SHALL 删除会话及其所有消息，返回 204

---

### Requirement: 会话标题自动生成

会话 title SHALL 取第一条用户消息的前 20 个字符；若消息为空则使用默认标题「新对话」。

#### Scenario: 首条消息触发标题更新

- **GIVEN** 会话 title 为「新对话」
- **WHEN** 用户发送第一条消息
- **THEN** 系统 SHALL 将会话 title 更新为该消息内容的前 20 字符
