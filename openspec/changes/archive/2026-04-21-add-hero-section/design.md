## Context

当前项目是 Vite 默认模板，`#root` 被硬约束为 `1126px` 宽度并带左右边框，无法实现全屏 Hero。主题系统目前仅响应 `prefers-color-scheme`，不支持手动切换。项目无任何个人内容，首次从零构建。

## Goals / Non-Goals

**Goals:**
- 实现全屏 Hero Section，包含个人信息、CTA 按钮、流星粒子背景
- 建立可扩展的亮/暗主题切换系统
- 重构根布局为全宽，为后续 sections 打好基础

**Non-Goals:**
- 导航栏组件
- Projects Section 内容
- 后端 API
- 粒子数量的移动端精细调优

---

## Decisions

### D1：粒子库选择 tsParticles（@tsparticles/react + @tsparticles/slim）

**选择**：tsParticles

**理由**：
- 原生支持流星/轨迹效果（`move.trail`）和鼠标排斥互动（`interactivity.events.onHover`）
- `@tsparticles/slim` 包体约 40KB gzip，满足首屏 < 2s 的性能要求
- 提供 React hooks（`useParticlesEngine`），与 React 19 兼容

**备选方案及排除原因**：
- 手写 Canvas：控制力强，但流星轨迹和物理交互实现成本过高
- three.js：功能过重，bundle 过大，overkill

---

### D2：主题系统采用 `.dark` class + localStorage

**选择**：`<html class="dark">` 切换 + `localStorage.theme`

**理由**：
- Tailwind v4 官方支持通过 `@custom-variant dark (&:where(.dark, .dark *))` 配置 class-based dark mode
- 实践中发现 `data-attribute` 策略在 Tailwind v4 的 `@custom-variant` 中存在优先级问题（非 `@layer` 的全局 CSS 会覆盖工具类），切换为 class 策略后问题消除
- localStorage 持久化用户偏好，默认回退到 `prefers-color-scheme`

**FOUC 防止方案**：在 `index.html` 的 `<head>` 中内联一段同步脚本，在浏览器首次渲染前写入 `.dark` class：

```html
<script>
  (function() {
    var saved = localStorage.getItem('theme');
    var valid = saved === 'dark' || saved === 'light';
    var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (valid ? saved === 'dark' : system === 'dark') {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

**Tailwind v4 配置**：在 `index.css` 中添加：
```css
@custom-variant dark (&:where(.dark, .dark *));
```

---

### D3：布局重构 — body 全宽，section 自管约束

**选择**：删除 `#root` 的 `width/max-width` 约束，各 section 自行管理内边距和最大宽度

**理由**：
- Hero 需要真正全屏（100vw），内容 section 后续需要各自的约束宽度
- 统一在 `#root` 约束宽度无法支持「某些 section 全宽，某些 section 收窄」的布局需求

**布局结构**：
```
<body>  全宽
  └─ <div id="root">  全宽，flex column
       ├─ <HeroSection>   100svh，全宽，粒子背景
       └─ <section id="projects">  锚点占位，后续扩展
```

---

### D4：粒子在 prefers-reduced-motion 下完全禁用

**选择**：检测到 `prefers-reduced-motion: reduce` 时，不渲染 `<Particles>` 组件，而非仅停止动画

**理由**：tsParticles 的 `reducedMotion` 配置项仍会渲染静态粒子，对部分用户仍有干扰。完全不渲染更符合无障碍语义，且简化代码路径。

---

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| tsParticles 首次加载阻塞首屏 | 使用 React `lazy()` + `Suspense` 异步加载 Particles 组件 |
| 粒子动画在低端设备卡顿 | 限制最大粒子数量（≤ 80），移动端进一步减少（≤ 40） |
| 渐变背景与文字对比度不足 | Hero 文字区域添加半透明遮罩层（`backdrop`），确保 WCAG AA（4.5:1）|
| 主题切换时粒子颜色不更新 | 监听 `data-theme` 变化，通过 key 重置 Particles 实例 |
