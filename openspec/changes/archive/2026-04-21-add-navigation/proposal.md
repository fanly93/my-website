## Why

个人品牌站目前只有 Hero Section，缺乏全局导航入口。随着 Projects、Contact 等 section 的增加，用户无法快速跳转到目标区域。顶部导航栏是单页应用的核心交互骨架，需要在内容扩展前建立好。

## What Changes

- 新增 `Navbar` 组件：固定顶部，左侧显示名字/Logo，右侧包含导航链接与 ThemeToggle
- 新增滚动感知背景：顶部时透明，滚动离开 Hero 后出现 `backdrop-blur` 磨砂玻璃效果
- 新增 Active 高亮：通过 IntersectionObserver 检测当前可见 section，对应导航链接高亮
- 迁移 ThemeToggle：从独立浮动按钮移入 Navbar 右侧，移除原 `fixed` 定位
- 完善锚点体系：HeroSection 补 `id="home"`，新增 `id="contact"` 占位 section
- 补全 `scroll-margin-top`：各 section 预留 Navbar 高度偏移，防止标题被遮挡

## Capabilities

### New Capabilities

- `navbar`：全局顶部导航，含链接、ThemeToggle、滚动触发背景、Active 状态

### Modified Capabilities

- `hero-section`：新增 `id="home"`，新增 `scroll-margin-top` 偏移
- `theme-system`：ThemeToggle 入口从独立浮动迁移至 Navbar 内部

## Out of Scope

- 不做搜索功能
- 不做多级下拉菜单
- 不做用户登录和注册
- 不做移动端汉堡菜单（3 个链接直接展示，字体适配缩小）
- 不做 Projects / Contact section 实际内容（只放锚点占位）
- 不做页面路由（保持单页锚点滚动模式）

## Impact

- **App.tsx**：移除独立 `<ThemeToggle>`，新增 `<Navbar>` 和 `<section id="contact">`
- **ThemeToggle**：props 接口不变，位置从 App 层移入 Navbar
- **HeroSection**：`<section>` 补 `id="home"` 和 `scroll-margin-top`
- **index.css**：为所有 section 添加 `scroll-margin-top` 基础样式
- **z-index 层级**：Navbar `z-50`（与原 ThemeToggle 一致），MouseTrail `z-40` 不变
