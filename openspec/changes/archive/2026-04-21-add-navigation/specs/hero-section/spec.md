## MODIFIED Requirements

### Requirement: 全屏展示个人信息

Hero Section SHALL 占据完整视口高度（`100svh`），居中展示以下内容：姓名（`<h1>`）、职业标题（`<p>`）、一句话个人介绍（`<p>`）、CTA 按钮。Hero Section 的根元素 SHALL 携带 `id="home"` 属性，以供 Navbar 导航链接锚点定位，并设置 `scroll-margin-top: 64px` 以防止 Navbar 遮挡。

#### Scenario: 桌面端正常渲染

- **WHEN** 用户在桌面浏览器打开网站
- **THEN** Hero Section 高度等于视口高度，内容垂直水平居中显示

#### Scenario: 移动端浏览器地址栏遮挡

- **WHEN** 用户在移动端浏览器打开网站，浏览器地址栏占用部分视口
- **THEN** Hero Section 使用 `100svh`（small viewport height），内容不被地址栏遮挡

#### Scenario: Navbar 锚点跳转不遮挡内容（边界）

- **WHEN** 用户通过 Navbar「首页」链接跳转至 `#home`
- **THEN** Hero Section 顶部内容不被固定 Navbar 遮挡，`scroll-margin-top` 生效
