## ADDED Requirements

### Requirement: 系统维护用户 profile 数据

系统 SHALL 为每个用户存储以下 profile 字段：id、email、username、avatar_url（可空）、level（整数）、streak_days（整数）、created_at。`GET /users/me` SHALL 返回当前认证用户的完整 profile。

#### Scenario: 获取自身 profile 成功

- **GIVEN** 用户已认证
- **WHEN** 调用 `GET /users/me`
- **THEN** 系统 SHALL 返回 200 及 UserProfile 对象，所有字段完整

#### Scenario: 未认证请求被拒绝

- **WHEN** 未携带有效 token 调用 `GET /users/me`
- **THEN** 系统 SHALL 返回 401

---

### Requirement: 用户可更新用户名

`PATCH /users/me` SHALL 接受 username 的部分更新，其余字段（level、streak_days）由系统维护，不允许客户端直接修改。

#### Scenario: 更新用户名成功

- **GIVEN** 用户已认证
- **WHEN** 提交有效的 username
- **THEN** 系统 SHALL 返回 200 及更新后的 UserProfile

#### Scenario: 提交不允许修改的字段被忽略

- **GIVEN** 用户已认证
- **WHEN** 请求体包含 level 或 streak_days 字段
- **THEN** 系统 SHALL 忽略这些字段，仅处理允许的字段

#### Scenario: username 为空字符串时返回错误

- **GIVEN** 用户已认证
- **WHEN** 提交空字符串 username
- **THEN** 系统 SHALL 返回 422

---

### Requirement: 用户可上传本地头像图片 [变更 2026-04-24]

`POST /users/me/avatar` SHALL 接受 multipart/form-data 格式的图片文件，存储至服务器并更新用户 avatar_url。

#### Scenario: 上传合法图片成功

- **GIVEN** 用户已认证
- **WHEN** 提交 JPEG / PNG / GIF / WebP 格式且不超过 5 MB 的图片
- **THEN** 系统 SHALL 保存文件，返回 200 及含新 avatar_url 的 UserProfile

#### Scenario: 文件格式不支持

- **GIVEN** 用户已认证
- **WHEN** 提交非图片格式文件
- **THEN** 系统 SHALL 返回 422

#### Scenario: 文件超过大小限制

- **GIVEN** 用户已认证
- **WHEN** 提交超过 5 MB 的图片
- **THEN** 系统 SHALL 返回 422

---

### Requirement: 前端展示用户 profile 页面

系统 SHALL 在 `/#/profile` 渲染用户资料页，展示头像、用户名、等级、连续学习天数，并提供用户名编辑和头像上传入口。页面 SHALL 提供返回 Dashboard 的导航链接。[导航入口 变更 2026-04-24]

#### Scenario: 进入 profile 页加载用户数据

- **GIVEN** 用户已认证
- **WHEN** 访问 `/#/profile`
- **THEN** 前端 SHALL 调用 `GET /users/me` 并展示返回的 profile 数据

#### Scenario: 修改用户名并保存

- **GIVEN** 用户已认证且在 profile 页
- **WHEN** 用户修改用户名后点击保存
- **THEN** 前端 SHALL 调用 `PATCH /users/me`，成功后刷新显示新数据，并同步更新侧边栏用户信息 [同步 变更 2026-04-24]

#### Scenario: 上传本地头像 [变更 2026-04-24]

- **GIVEN** 用户已认证且在 profile 页
- **WHEN** 用户点击头像上传按钮并选择本地图片
- **THEN** 前端 SHALL 调用 `POST /users/me/avatar`，成功后即时更新头像预览，并同步更新侧边栏头像

#### Scenario: 返回 Dashboard [变更 2026-04-24]

- **GIVEN** 用户在 profile 页
- **WHEN** 点击「返回 Dashboard」
- **THEN** 前端 SHALL 跳转至 `/#/dashboard`

#### Scenario: API 加载失败显示错误状态

- **WHEN** `GET /users/me` 返回非 200 响应
- **THEN** 前端 SHALL 显示错误提示，不渲染空白内容
