## ADDED Requirements

### Requirement: 用户可通过邮箱和密码登录

系统 SHALL 提供登录 API（`POST /auth/login`），验证凭证后签发 access token 和 refresh token。

#### Scenario: 登录成功

- **GIVEN** 用户已注册且凭证正确
- **WHEN** 用户提交正确的邮箱和密码
- **THEN** 系统 SHALL 返回 200，包含 access_token、refresh_token、token_type

#### Scenario: 凭证错误

- **WHEN** 用户提交的邮箱不存在或密码错误
- **THEN** 系统 SHALL 返回 401，detail 为「邮箱或密码错误」（不区分具体原因）

#### Scenario: 字段缺失

- **WHEN** 请求体缺少 email 或 password 字段
- **THEN** 系统 SHALL 返回 422

---

### Requirement: 前端提供登录页面

系统 SHALL 在 `/#/login` 渲染登录表单，包含邮箱、密码输入框和提交按钮。

#### Scenario: 登录成功后跳转目标页面

- **WHEN** 登录 API 返回 200
- **THEN** 前端 SHALL 将 token 存入 localStorage，并跳转至登录前的目标路径；若无目标路径则跳转至 `/#/dashboard`

#### Scenario: 登录失败显示错误信息

- **WHEN** 登录 API 返回 4xx
- **THEN** 前端 SHALL 在表单内显示错误信息，清空密码输入框，不跳转页面

#### Scenario: 已认证用户访问登录页重定向

- **GIVEN** 用户已认证
- **WHEN** 访问 `/#/login`
- **THEN** 系统 SHALL 重定向至 `/#/dashboard`

---

### Requirement: 用户可登出

系统 SHALL 提供登出功能，清除客户端 token，并调用 `POST /auth/logout`。

#### Scenario: 登出成功

- **GIVEN** 用户已认证
- **WHEN** 用户点击登出
- **THEN** 前端 SHALL 清除 localStorage 中的 access_token 和 refresh_token，跳转至 `/#/login`

#### Scenario: 登出后访问受保护路由被拦截

- **GIVEN** 用户已执行登出操作
- **WHEN** 访问 `/#/dashboard`
- **THEN** 系统 SHALL 重定向至 `/#/login`
