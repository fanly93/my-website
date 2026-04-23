## Phase 1. 基础架构：布局重构 + 主题系统

- [x] 1.1 重构 `index.css`：移除 `#root` 的 `width/max-width/border` 约束，body 改为全宽
- [x] 1.2 在 `index.css` 中添加 `@custom-variant dark` 配置，绑定 `.dark` class（class-based 策略）
- [x] 1.3 在 `index.html` 的 `<head>` 中添加 FOUC 防止内联脚本（读 localStorage → 添加 `.dark` class）
- [x] 1.4 清理 `App.tsx`，移除 Vite 默认模板内容，保留最小骨架（空 fragment）

## Phase 2. 主题切换 Hook + 按钮组件

- [x] 2.1 创建 `src/hooks/useTheme.ts`：封装 `.dark` class 切换逻辑，返回 `{ theme, toggleTheme }`
- [x] 2.2 创建 `src/components/ThemeToggle.tsx`：图标切换按钮（太阳/月亮），接收 `theme`/`toggleTheme` props
- [x] 2.3 在 `App.tsx` 中引入 `ThemeToggle`，悬浮定位于页面右上角（fixed，z-index 适当）

## Phase 3. Hero Section 内容与排版

- [x] 3.1 创建 `src/components/HeroSection.tsx`：全屏容器（`min-h-svh`），flex 居中布局
- [x] 3.2 在 Hero 中添加姓名（`<h1>`）、职业（`<p>`）、一句话介绍（`<p>`）占位内容
- [x] 3.3 添加 CTA 按钮「查看我的项目」，`href="#projects"`，`scroll-behavior: smooth`
- [x] 3.4 在 `App.tsx` 底部添加 `<section id="projects">` 锚点占位
- [x] 3.5 调整 Hero 内文字排版（字号、间距、响应式），确保移动端可读

## Phase 4. 粒子背景接入

- [x] 4.1 安装依赖：`@tsparticles/react`、`@tsparticles/slim`
- [x] 4.2 创建 `src/components/ParticlesBackground.tsx`：封装 tsParticles，流星轨迹配置
- [x] 4.3 配置鼠标排斥互动（`repulse` on hover）
- [x] 4.4 配置亮/暗两套粒子配色，监听 `theme` 变化通过 `key` 重置实例
- [x] 4.5 添加 `prefers-reduced-motion` 检测，为 `true` 时不渲染粒子组件
- [x] 4.6 使用 `React.lazy` + `Suspense` 异步加载 `ParticlesBackground`，避免阻塞首屏
- [x] 4.7 在 `HeroSection` 中集成 `ParticlesBackground`，确保粒子层在文字层之下（z-index）

## Phase 5. 鼠标拖尾效果

- [x] 5.1 创建 `src/components/MouseTrail.tsx`：固定视口 Canvas，`requestAnimationFrame` 逐帧绘制发光径向渐变拖尾
- [x] 5.2 配置亮/暗两套拖尾配色，接收 `theme` prop 感知主题
- [x] 5.3 在 `App.tsx` 中引入 `MouseTrail`，`prefers-reduced-motion` 为 true 时不渲染
- [x] 5.4 Canvas 设置 `pointer-events-none`，确保不拦截页面鼠标事件
- [x] 5.5 监听 `resize` 事件，Canvas 尺寸随视口自适应
