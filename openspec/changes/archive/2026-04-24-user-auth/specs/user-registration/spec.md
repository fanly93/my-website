## ADDED Requirements

### Requirement: 用户可通过邮箱和密码注册账号

系统 SHALL 提供注册 API（`POST /auth/register`），接受邮箱、密码、用户名，创建用户并返回用户基本信息。密码 SHALL 使用 bcrypt 哈希存储，不得明文保存。

#### Scenario: 注册成功

- **GIVEN** 该邮箱尚未注册
- **WHEN** 用户提交有效的邮箱、密码（≥8位）、用户名
- **THEN** 系统 SHALL 返回 201，包含用户 id、email、username、created_at

#### Scenario: 邮箱已被注册

- **GIVEN** 该邮箱已存在于数据库
- **WHEN** 用户提交该邮箱进行注册
- **THEN** 系统 SHALL 返回 409，detail 为「邮箱已注册」

#### Scenario: 字段校验失败

- **GIVEN** 请求体字段不满足约束
- **WHEN** 用户提交邮箱格式无效、密码少于 8 位或用户名为空
- **THEN** 系统 SHALL 返回 422，包含具体字段的错误说明

---

### Requirement: 前端提供注册页面

系统 SHALL 在 `/#/register` 渲染注册表单，包含邮箱、密码、用户名输入框和提交按钮。

#### Scenario: 注册成功后跳转登录页

- **WHEN** 注册 API 返回 201
- **THEN** 前端 SHALL 跳转至 `/#/login`，MAY 显示注册成功提示

#### Scenario: 注册失败显示错误信息

- **WHEN** 注册 API 返回 4xx 错误
- **THEN** 前端 SHALL 在表单内显示对应错误信息，不跳转页面

#### Scenario: 已认证用户访问注册页重定向

- **GIVEN** 用户已认证
- **WHEN** 访问 `/#/register`
- **THEN** 系统 SHALL 重定向至 `/#/dashboard`
