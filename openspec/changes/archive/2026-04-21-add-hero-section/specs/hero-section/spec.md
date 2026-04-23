## ADDED Requirements

### Requirement: 全屏展示个人信息

Hero Section SHALL 占据完整视口高度（`100svh`），居中展示以下内容：姓名（`<h1>`）、职业标题（`<p>`）、一句话个人介绍（`<p>`）、CTA 按钮。

#### Scenario: 桌面端正常渲染

- **WHEN** 用户在桌面浏览器打开网站
- **THEN** Hero Section 高度等于视口高度，内容垂直水平居中显示

#### Scenario: 移动端浏览器地址栏遮挡

- **WHEN** 用户在移动端浏览器打开网站，浏览器地址栏占用部分视口
- **THEN** Hero Section 使用 `100svh`（small viewport height），内容不被地址栏遮挡

---

### Requirement: CTA 按钮锚点跳转

Hero Section SHALL 包含一个标记为「查看我的项目」的 CTA 按钮，点击后平滑滚动至页面内 `id="projects"` 的元素。

#### Scenario: 点击 CTA 正常跳转

- **WHEN** 用户点击「查看我的项目」按钮
- **THEN** 页面平滑滚动至 `#projects` 锚点位置

#### Scenario: 键盘访问 CTA 按钮

- **WHEN** 用户通过 Tab 键聚焦到 CTA 按钮并按下 Enter
- **THEN** 触发与鼠标点击相同的锚点跳转行为

#### Scenario: 锚点目标不存在（边界）

- **WHEN** 页面中不存在 `id="projects"` 的元素
- **THEN** 点击 CTA 不触发报错，页面无可见跳转（浏览器默认行为）

---

### Requirement: 流星轨迹型粒子背景

Hero Section 的背景 SHALL 渲染流星轨迹型粒子动效，粒子数量不超过 80 个（桌面端），支持鼠标排斥互动。亮色/暗色模式下使用不同配色方案。

#### Scenario: 暗色模式粒子配色

- **WHEN** 当前主题为暗色模式
- **THEN** 粒子颜色为冷蓝/紫色调（如 `#60a5fa`、`#a78bfa`），背景深色

#### Scenario: 亮色模式粒子配色

- **WHEN** 当前主题为亮色模式
- **THEN** 粒子颜色为紫色/靛蓝色调（如 `#7c3aed`、`#4f46e5`），背景浅色

#### Scenario: 鼠标排斥互动

- **WHEN** 用户将鼠标悬停在 Hero 区域内移动
- **THEN** 附近粒子被推离鼠标位置

#### Scenario: 移动端无鼠标互动

- **WHEN** 用户在触摸屏设备上浏览
- **THEN** 粒子数量减少至不超过 40 个，鼠标互动事件不触发

#### Scenario: prefers-reduced-motion 降级（边界）

- **WHEN** 用户系统开启了「减少动态效果」偏好（`prefers-reduced-motion: reduce`）
- **THEN** 粒子组件完全不渲染，Hero 背景退化为纯色（使用 CSS 变量 `--bg`）

---

### Requirement: 文字区域无障碍对比度

Hero 内所有文字 SHALL 在粒子背景之上维持不低于 WCAG AA 标准的对比度（正文 4.5:1，大号文字 3:1）。

#### Scenario: 亮色/暗色模式均满足对比度

- **WHEN** 用户在亮色或暗色模式下查看 Hero
- **THEN** 姓名、职业、介绍文字对比度均不低于各自标准

#### Scenario: 粒子覆盖文字区域（边界）

- **WHEN** 粒子动画运行至文字正上方位置
- **THEN** 文字区域背景遮罩确保文字始终可读，不因粒子遮挡而影响阅读
