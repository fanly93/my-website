# about-section Specification

## Purpose
TBD - created by archiving change add-about-section. Update Purpose after archive.
## Requirements
### Requirement: 关于我区域布局

系统 SHALL 渲染一个 `id="contact"` 的全宽 section，在移动端为单列垂直布局，在桌面端（≥ 768px）为左右两栏布局：左侧展示个人头像，右侧展示个人简介文字。section 根元素 SHALL 设置 `scroll-margin-top: 64px` 以防止 Navbar 遮挡。

#### Scenario: 桌面端两栏展示

- **WHEN** 用户在宽度 ≥ 768px 的桌面浏览器中打开页面
- **THEN** 头像与简介以左右两栏并排展示

#### Scenario: 移动端单列展示

- **WHEN** 用户在移动端（宽度 < 768px）浏览器中打开页面
- **THEN** 头像在上、简介在下，垂直单列排列

#### Scenario: Navbar 锚点跳转不遮挡内容（边界）

- **WHEN** 用户通过 Navbar「联系我」链接跳转至 `#contact`
- **THEN** section 顶部内容不被固定 Navbar 遮挡，`scroll-margin-top` 生效

---

### Requirement: 个人头像展示

左侧 SHALL 展示一张圆形裁剪的个人头像图片（`<img loading="lazy" />`）。若头像图片缺失或加载失败，SHALL 显示渐变色圆形占位背景。

#### Scenario: 头像正常加载

- **WHEN** `public/avatar.jpg` 存在且可访问
- **THEN** 头像以圆形裁剪方式展示，比例为 1:1

#### Scenario: 头像缺失降级（边界）

- **WHEN** 头像图片不存在或加载失败
- **THEN** 显示渐变色圆形占位背景，页面布局不受影响

---

### Requirement: 个人简介文字

右侧 SHALL 展示开发者的个人简介，包含：姓名或称呼（`<h2>`）、一段个人介绍文字（`<p>`）。文字颜色 SHALL 在亮色/暗色模式下均满足 WCAG AA 对比度标准。

#### Scenario: 简介内容完整展示

- **WHEN** 用户访问关于我区域
- **THEN** 姓名和个人介绍文字均清晰可读，亮暗模式下对比度均达标

#### Scenario: 暗色模式文字颜色（边界）

- **WHEN** 全局主题为暗色模式
- **THEN** 简介文字为浅色（如 `dark:text-white` / `dark:text-gray-300`），背景为深色，对比度达标

---

### Requirement: 社交账号链接展示

关于我区域 SHALL 在简介下方展示社交账号入口，至少包含 GitHub 链接和邮箱链接。每个链接 SHALL 带图标，GitHub 链接在新标签页打开（`target="_blank" rel="noopener noreferrer"`），邮箱链接使用 `mailto:` 协议。系统 SHALL NOT 提供任何表单输入或信息提交功能。

#### Scenario: GitHub 链接跳转

- **WHEN** 用户点击 GitHub 图标链接
- **THEN** 在新标签页打开 GitHub 主页，`rel="noopener noreferrer"` 已设置

#### Scenario: 邮箱链接触发邮件客户端

- **WHEN** 用户点击邮箱图标链接
- **THEN** 系统调用默认邮件客户端并预填收件人地址

#### Scenario: 无表单提交功能（边界）

- **WHEN** 用户浏览关于我区域
- **THEN** 页面不存在任何输入框、提交按钮或表单元素

#### Scenario: 键盘访问社交链接

- **WHEN** 用户通过 Tab 键聚焦到社交链接并按下 Enter
- **THEN** 触发与鼠标点击相同的跳转行为，焦点样式可见

---

### Requirement: 暗色/亮色模式适配

关于我区域 SHALL 响应全局主题切换，亮色/暗色模式下使用对应的背景色、文字色和边框色。

#### Scenario: 暗色模式区域样式

- **WHEN** 全局主题为暗色模式
- **THEN** section 背景为深色，文字为浅色，社交图标颜色适配暗色背景

#### Scenario: 亮色模式区域样式

- **WHEN** 全局主题为亮色模式
- **THEN** section 背景为浅色，文字为深色，社交图标颜色适配亮色背景

