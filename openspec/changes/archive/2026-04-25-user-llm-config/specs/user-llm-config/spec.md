## ADDED Requirements

### Requirement: 用户可读取和更新个人 LLM 配置（按 Provider 分别存储）

系统 SHALL 为每位认证用户提供以下端点：
- `GET /users/me/llm-config`：返回当前激活 Provider 的配置（is_active=True），未配置时返回 404
- `GET /users/me/llm-configs`：返回该用户所有已保存 Provider 的配置列表
- `PUT /users/me/llm-config`：按 provider 进行 upsert（插入或更新），同时将该 Provider 标记为 is_active，其余 Provider 标记为 inactive

每位用户每个 Provider 独立存储一行（`user_id + provider` 唯一约束），多个 Provider 可并存。

响应体包含字段：provider、api_key_hint（后 4 位掩码）、base_url、model、custom_models（已保存自定义模型名列表）。

#### Scenario: 获取当前激活配置

- **GIVEN** 用户已至少配置一个 Provider 并保存
- **WHEN** 调用 `GET /users/me/llm-config`
- **THEN** 系统 SHALL 返回 200，含当前 is_active=True 的 Provider 配置

#### Scenario: 获取所有 Provider 配置

- **GIVEN** 用户已配置 DeepSeek 和 DashScope 两个 Provider
- **WHEN** 调用 `GET /users/me/llm-configs`
- **THEN** 系统 SHALL 返回 200，含两条配置记录

#### Scenario: 获取未配置时返回 404

- **GIVEN** 用户从未配置任何 LLM 凭据
- **WHEN** 调用 `GET /users/me/llm-config`
- **THEN** 系统 SHALL 返回 404

#### Scenario: 首次为某 Provider 保存配置

- **GIVEN** 用户尚未配置该 Provider 的凭据
- **WHEN** 调用 `PUT /users/me/llm-config`，body 含 provider、api_key、model
- **THEN** 系统 SHALL 创建该 Provider 的配置记录，将其设为 is_active，其余 Provider 设为 inactive，返回 200 及掩码后配置

#### Scenario: 更新已有 Provider 配置（保留 API Key）

- **GIVEN** 用户已保存某 Provider 的 API Key
- **WHEN** 再次调用 `PUT /users/me/llm-config`，body 不含 api_key 字段（或为空）
- **THEN** 系统 SHALL 保留数据库中原有 API Key，仅更新 model 和 base_url，返回 200

#### Scenario: 更新已有 Provider 配置（替换 API Key）

- **GIVEN** 用户已保存某 Provider 的 API Key
- **WHEN** 再次调用 `PUT /users/me/llm-config`，body 含新的非空 api_key
- **THEN** 系统 SHALL 用新 API Key 覆盖原有值，返回 200

#### Scenario: 首次配置缺少 API Key

- **WHEN** PUT 请求体中该 Provider 为首次配置，且未提供 api_key
- **THEN** 系统 SHALL 返回 422，不修改数据库

---

### Requirement: 自定义模型列表按 Provider 持久化

每个 Provider 配置行 SHALL 维护一个 `custom_models` JSON 数组，累积该用户为该 Provider 保存过的所有非预设模型名。每次 PUT 保存非预设模型时自动追加（不重复）；GET 响应中返回该列表供前端展示。

#### Scenario: 保存自定义模型后列表追加

- **GIVEN** 用户当前 deepseek 配置的 custom_models 为 `["my-model-v1"]`
- **WHEN** PUT 请求保存 model="my-model-v2"
- **THEN** 系统 SHALL 将 `custom_models` 更新为 `["my-model-v1", "my-model-v2"]`，不丢失历史

#### Scenario: 保存预设模型不影响 custom_models

- **GIVEN** 用户的 custom_models 为 `["my-model-v1"]`
- **WHEN** PUT 请求保存 model="deepseek-chat"（预设模型）
- **THEN** 系统 SHALL 不修改 custom_models 列表

---

### Requirement: Base URL 可选，省略时使用 Provider 默认值

PUT 请求中 base_url 字段 SHALL 为可选。若未提供或为空，系统 SHALL 使用对应 Provider 的默认 Base URL 补全后存入数据库。

#### Scenario: 省略 Base URL 使用默认值

- **GIVEN** provider 为 deepseek
- **WHEN** PUT 请求未包含 base_url 字段
- **THEN** 系统 SHALL 将 `https://api.deepseek.com/v1` 作为 base_url 存入数据库
