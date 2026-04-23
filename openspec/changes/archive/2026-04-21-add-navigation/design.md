## Context

当前站点已有 Hero Section、主题切换和鼠标拖尾，但没有全局导航。ThemeToggle 作为独立 `fixed` 浮动按钮存在，z-index 为 50。Navbar 需要接管导航职责并容纳 ThemeToggle，形成统一的顶部控制栏。

## Goals / Non-Goals

**Goals:**
- 建立全局导航骨架，支持平滑滚动跳转各 section
- 滚动感知：顶部透明，离开 Hero 后出现磨砂玻璃背景
- Active 高亮：当前可见 section 对应链接高亮
- ThemeToggle 迁移进 Navbar，保持 props 接口不变

**Non-Goals:**
- 移动端汉堡菜单
- 多级下拉菜单
- 路由切换（保持锚点滚动模式）

---

## Decisions

### D1：滚动感知使用 `useScrolled` Hook + CSS transition

**选择**：监听 `window.scroll` 事件，超过阈值（60px）后切换 `scrolled` 状态，Tailwind 条件类控制样式。

**理由**：
- 无需额外依赖，原生 scroll 事件足够
- `backdrop-blur` + `bg-white/80 dark:bg-gray-950/80` 实现磨砂玻璃，配合 `transition` 平滑过渡
- 阈值 60px 约等于 Hero 内容出现前的空白区域，时机自然

**备选方案及排除原因**：
- IntersectionObserver 监听 Hero：实现更精确，但比直接监听 scroll 复杂，收益不大

---

### D2：Active 高亮使用 `useActiveSection` Hook（IntersectionObserver）

**选择**：为每个 section 创建 IntersectionObserver，`threshold: 0.5` 超过半屏可见时标记为 active。

**理由**：
- 比 scroll + getBoundingClientRect 性能更好（浏览器原生优化）
- 不需要手动计算位置，不受 scroll-margin-top 影响
- `rootMargin: '-50% 0px -50% 0px'` 可以精确捕捉"屏幕中央"的 section

**数据流**：
```
IntersectionObserver
  ├─ 观察 #home, #projects, #contact
  └─ 回调更新 activeSection state
        ↓
  Navbar 接收 activeSection
        ↓
  对应 NavLink 高亮
```

---

### D3：ThemeToggle 迁移——Navbar 接收 theme/toggleTheme props

**选择**：Navbar 接收 `theme` 和 `toggleTheme` 作为 props，内部渲染 ThemeToggle 组件。

**理由**：
- ThemeToggle 的 props 接口不变（`theme` + `toggleTheme`），零改动
- `useTheme()` 仍在 App.tsx 唯一调用，单一来源不变
- App.tsx 层级清晰：`<Navbar theme toggleTheme />` 取代 `<ThemeToggle />` + `<Navbar />`

---

### D4：z-index 层级规划

```
z-50  Navbar（含 ThemeToggle，顶层可交互）
z-40  MouseTrail Canvas（pointer-events-none，不阻断点击）
z-10  Hero 文字内容
z-0   ParticlesBackground Canvas
```

原 ThemeToggle 的 `z-50` 合并进 Navbar，层级总数不增加。

---

### D5：scroll-margin-top 统一管理

**选择**：在 `index.css` 中为所有 section 添加 `scroll-margin-top: 64px`（Navbar 高度）。

**理由**：
- 统一管理，不在每个 section 组件重复写
- Navbar 高度固定为 64px，写死比动态计算更简单

---

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 多个 IntersectionObserver 实例性能开销 | 只有 3 个 section，开销可忽略 |
| 滚动阈值 60px 在不同屏幕上时机不一致 | 阈值仅影响视觉触发时机，不影响功能正确性 |
| Navbar 透明时文字与 Hero 粒子背景对比度 | 左侧名字使用 `text-white dark:text-white`（Hero 背景深色），亮色模式透明期加文字阴影兜底 |
