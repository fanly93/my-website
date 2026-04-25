## ADDED Requirements

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

#### Scenario: 已认证用户访问 AI 对话页

- **GIVEN** 用户已认证
- **WHEN** 访问 `/#/ai-chat`
- **THEN** 系统 SHALL 渲染 AIChatPage

#### Scenario: 未认证用户访问 AI 对话页被重定向

- **GIVEN** 用户未认证
- **WHEN** 访问 `/#/ai-chat`
- **THEN** 系统 SHALL 重定向至 `/#/login`

#### Scenario: 登录后跳回原目标路径

- **GIVEN** 未认证用户已被重定向至 `/#/login`
- **WHEN** 完成登录
- **THEN** 系统 SHALL 跳转回原目标路径（如 `/#/dashboard`），而非固定首页

#### Scenario: token 在 dashboard 内过期后自动处理

- **GIVEN** 用户已认证且在 dashboard 内，access token 已过期
- **WHEN** 用户触发 API 操作
- **THEN** 系统 SHALL 自动刷新 token，对用户透明；refresh 失败时跳转至 `/#/login`

#### Scenario: 访问未定义路径重定向至根路径

- **WHEN** 用户访问任意未定义路径
- **THEN** 系统 SHALL 重定向至 `/#/`，不渲染空白页

---

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

### Requirement: 品牌站 HeroSection 提供进入 dashboard 的入口

系统 SHALL 在 HeroSection 中展示「进入学习助手」按钮，点击后导航至 `/#/dashboard`。

#### Scenario: 点击入口按钮进入 dashboard

- **WHEN** 用户点击「进入学习助手」按钮
- **THEN** 系统 SHALL 导航至 `/#/dashboard`，无页面刷新

#### Scenario: 入口按钮与主 CTA 视觉区分

- **WHEN** 渲染 HeroSection
- **THEN** 「进入学习助手」按钮 SHALL 使用次要按钮样式，与「查看我的项目」按钮同时可见且视觉层级不同

---

### Requirement: dashboard 提供返回品牌站的导航

系统 SHALL 在 dashboard 中提供返回品牌站的链接。

#### Scenario: 点击返回链接离开 dashboard

- **WHEN** 用户点击「返回主页」链接
- **THEN** 系统 SHALL 导航至 `/#/`

#### Scenario: 非法 hash 路径不崩溃

- **WHEN** 用户手动输入非法 hash 路径
- **THEN** 系统 SHALL 重定向至 `/#/`，不抛出未捕获错误
