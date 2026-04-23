## Why

个人品牌站目前仍是 Vite 默认模板，缺乏任何个人内容。Hero Section 是访客进入网站的第一印象，需要清晰传达身份信息并引导访客探索项目作品。

## What Changes

- 新增全屏 Hero Section 组件，展示名字、职业、一句话介绍及 CTA 按钮
- 新增流星轨迹型粒子背景，支持鼠标排斥互动
- 新增鼠标光标拖尾效果（MouseTrail），鼠标移动时产生发光彗星尾迹
- 新增主题系统（亮/暗手动切换 + localStorage 持久化 + FOUC 防止）
- 重构根布局：废弃 `#root` 的 `1126px` 宽度约束，改为 body 全宽，各 section 自管内边距
- 引入 tsParticles 依赖

## Capabilities

### New Capabilities

- `hero-section`：全屏 Hero，包含个人信息展示、CTA 按钮、流星粒子背景、鼠标互动
- `theme-system`：亮/暗主题切换，data-theme attribute 驱动，localStorage 持久化，FOUC 防止
- `mouse-trail`：全局鼠标光标拖尾，Canvas 绘制发光径向渐变点，跟随光标消散，主题感知配色

### Modified Capabilities

（无，specs/ 目录为空，无现有规范需变更）

## Out of Scope

- 不做导航栏（Navbar 组件）
- 不做 Projects Section 内容（只放锚点占位 `id="projects"`）
- 不做后端 API
- 不做移动端粒子数量精细调优
- 不做 i18n 多语言
- 不做 UI 元素过渡动画（文字入场、按钮 hover 动效等）
- 不做页面滚动动画（scroll-triggered animations）


## Impact

- **布局**：`index.css` 中 `#root` 的 `width: 1126px` 约束被移除，现有模板样式全部失效（模板内容本次同步清除）
- **依赖**：新增 `@tsparticles/react`、`@tsparticles/slim`
- **index.html**：新增 `<head>` 内联脚本防止主题 FOUC
- **Tailwind v4**：新增 `@custom-variant dark` 配置，切换为 data-attribute 驱动的 dark variant
