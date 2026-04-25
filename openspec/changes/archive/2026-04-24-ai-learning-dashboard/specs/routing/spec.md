## ADDED Requirements

### Requirement: 应用使用 HashRouter 提供客户端路由

系统 SHALL 使用 HashRouter，根路径渲染品牌站，`/dashboard` 渲染工作台，未定义路径重定向至根路径。

#### Scenario: 访问根路径显示品牌站

- **WHEN** 用户访问 `/#/`
- **THEN** 系统 SHALL 渲染品牌站首页

#### Scenario: 访问 dashboard 路径显示工作台

- **WHEN** 用户访问 `/#/dashboard`
- **THEN** 系统 SHALL 渲染 DashboardLayout 及其子内容

#### Scenario: 访问未定义路径重定向至根路径

- **WHEN** 用户访问任意未定义路径
- **THEN** 系统 SHALL 重定向至 `/#/`，不渲染空白页

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
