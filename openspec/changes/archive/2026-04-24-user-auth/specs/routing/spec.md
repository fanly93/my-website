## ADDED Requirements

### Requirement: 新增登录、注册、个人资料路由

系统 SHALL 提供以下新路由：`/login`、`/register`、`/profile`。

#### Scenario: 访问登录页

- **WHEN** 用户访问 `/#/login`
- **THEN** 系统 SHALL 渲染 LoginPage

#### Scenario: 访问注册页

- **WHEN** 用户访问 `/#/register`
- **THEN** 系统 SHALL 渲染 RegisterPage

#### Scenario: 访问个人资料页（需认证）

- **GIVEN** 用户已认证
- **WHEN** 访问 `/#/profile`
- **THEN** 系统 SHALL 渲染 ProfilePage

---

## MODIFIED Requirements

### Requirement: 应用使用 HashRouter 提供客户端路由

系统 SHALL 使用 HashRouter，根路径渲染品牌站，`/dashboard` 渲染工作台（需认证），未定义路径重定向至根路径。`/dashboard` 及其所有子路径实施认证保护：已认证用户 SHALL 渲染 DashboardLayout 及其子内容；未认证用户 SHALL 被重定向至 `/#/login`，并在 URL 中携带原目标路径（`redirect` 参数），以便登录后跳回。

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
