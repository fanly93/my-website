## ADDED Requirements

### Requirement: access token 短期有效，用于 API 鉴权

系统 SHALL 签发有效期为 15 分钟的 access token（JWT）。受保护 API SHALL 校验 `Authorization: Bearer <token>` 头，token 无效或过期时返回 401。

#### Scenario: 有效 token 请求成功

- **GIVEN** 请求携带有效且未过期的 access token
- **WHEN** 调用受保护 API
- **THEN** 系统 SHALL 正常处理请求并返回数据

#### Scenario: 过期 token 返回 401

- **GIVEN** access token 已过期
- **WHEN** 调用受保护 API
- **THEN** 系统 SHALL 返回 401，detail 为「token 已过期」

#### Scenario: 无效 token 返回 401

- **GIVEN** token 格式错误或签名无效
- **WHEN** 调用受保护 API
- **THEN** 系统 SHALL 返回 401，detail 为「token 无效」

#### Scenario: 缺少 Authorization 头返回 401

- **GIVEN** 请求未携带 Authorization 头
- **WHEN** 调用受保护 API
- **THEN** 系统 SHALL 返回 401

---

### Requirement: refresh token 长期有效，用于换取新 access token

系统 SHALL 签发有效期为 7 天的 refresh token。`POST /auth/refresh` SHALL 接受有效的 refresh token，返回新的 access token 和 refresh token（rotation）。

#### Scenario: 使用有效 refresh token 换取新 token

- **GIVEN** refresh token 有效且未过期
- **WHEN** 客户端提交该 refresh token
- **THEN** 系统 SHALL 返回新的 access_token 和 refresh_token

#### Scenario: refresh token 过期返回 401

- **GIVEN** refresh token 已过期
- **WHEN** 客户端提交该 refresh token
- **THEN** 系统 SHALL 返回 401

---

### Requirement: 前端自动刷新 access token

当 API 返回 401 时，前端 SHALL 自动尝试用 refresh token 换取新 access token，成功后重试原请求；refresh 失败则跳转登录页。

#### Scenario: 401 触发自动刷新并重试

- **GIVEN** 本地存有有效 refresh token
- **WHEN** API 请求返回 401
- **THEN** 前端 SHALL 调用 `/auth/refresh`，获取新 token 后重试原请求，对业务代码透明

#### Scenario: refresh 失败强制登出

- **WHEN** `/auth/refresh` 返回 401
- **THEN** 前端 SHALL 清除所有本地 token 并跳转至 `/#/login`
