## ADDED Requirements

### Requirement: 新增 AI 对话受保护路由

系统 SHALL 在 `/#/ai-chat` 提供 AI 对话页面路由，该路由 SHALL 受 ProtectedRoute 保护，未认证用户访问时 SHALL 重定向至 `/#/login`。

#### Scenario: 已认证用户访问 AI 对话页

- **GIVEN** 用户已认证
- **WHEN** 访问 `/#/ai-chat`
- **THEN** 系统 SHALL 渲染 AIChatPage

#### Scenario: 未认证用户被重定向

- **GIVEN** 用户未认证
- **WHEN** 访问 `/#/ai-chat`
- **THEN** 系统 SHALL 重定向至 `/#/login`

---

## MODIFIED Requirements

### Requirement: 应用使用 HashRouter 提供客户端路由

系统 SHALL 使用 HashRouter，根路径渲染品牌站，`/dashboard` 渲染工作台（需认证），`/ai-chat` 渲染 AI 对话页（需认证），未定义路径重定向至根路径。`/dashboard` 及其所有子路径、`/ai-chat` 实施认证保护：已认证用户 SHALL 渲染对应页面；未认证用户 SHALL 被重定向至 `/#/login`，并在 URL 中携带原目标路径（`redirect` 参数），以便登录后跳回。

#### Scenario: 访问根路径显示品牌站

- **WHEN** 用户访问 `/#/`
- **THEN** 系统 SHALL 渲染品牌站首页

#### Scenario: 已认证用户访问 dashboard

- **GIVEN** 用户已认证
- **WHEN** 访问 `/#/dashboard`
- **THEN** 系统 SHALL 渲染 DashboardLayout 及其子内容

#### Scenario: 未认证用户访问 dashboard 被重定向

- **GIVEN** 用户未认证
- **WHEN** 访问 `/#/dashboard`
- **THEN** 系统 SHALL 重定向至 `/#/login`

#### Scenario: 登录后跳回原目标路径

- **GIVEN** 未认证用户已被重定向至 `/#/login`
- **WHEN** 完成登录
- **THEN** 系统 SHALL 跳转回原目标路径（如 `/#/dashboard`），而非固定首页

#### Scenario: token 在 dashboard 内过期后自动处理

- **GIVEN** 用户已认证且在 dashboard 内，access token 已过期
- **WHEN** 用户触发 API 操作
- **THEN** 系统 SHALL 自动刷新 token，对用户透明；refresh 失败时跳转至 `/#/login`
