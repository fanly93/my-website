## Phase 1. 基础准备：锚点与滚动偏移

- [x] 1.1 在 `HeroSection.tsx` 的 `<section>` 上添加 `id="home"`
- [x] 1.2 在 `index.css` 中为所有 section 添加 `scroll-margin-top: 64px`
- [x] 1.3 在 `App.tsx` 中新增 `<section id="contact" className="min-h-screen" />` 占位

## Phase 2. 自定义 Hooks

- [x] 2.1 创建 `src/hooks/useScrolled.ts`：监听 `window.scroll`，超过 60px 返回 `true`，含 cleanup
- [x] 2.2 创建 `src/hooks/useActiveSection.ts`：IntersectionObserver 监听 `#home`、`#projects`、`#contact`，返回当前 active section id

## Phase 3. Navbar 组件

- [x] 3.1 创建 `src/components/Navbar.tsx`：固定顶部容器（`fixed top-0 z-50 w-full h-16`），接收 `theme`、`toggleTheme` props
- [x] 3.2 实现滚动感知背景：`useScrolled` 控制 `backdrop-blur`、半透明底色、底部分隔线的条件类
- [x] 3.3 实现左侧 Logo/名字区域：链接到 `#home`，显示「小林fanly」
- [x] 3.4 实现右侧导航链接列表（首页、项目、联系我），`useActiveSection` 驱动 active 高亮样式
- [x] 3.5 将 `ThemeToggle` 移入 Navbar 右侧，传入 `theme`/`toggleTheme` props

## Phase 4. App.tsx 整合与清理

- [x] 4.1 在 `App.tsx` 中引入 `Navbar`，传入 `theme`/`toggleTheme`
- [x] 4.2 从 `App.tsx` 中移除独立的 `<ThemeToggle>` 组件引用及 import
