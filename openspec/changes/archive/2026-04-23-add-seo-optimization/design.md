## Context

站点为纯静态 SPA，部署于 GitHub Pages，base path `/my-website/`，无服务端渲染。SEO 优化只能在 `index.html` 的 `<head>` 中静态写入，无法做 per-route 动态 meta。当前 `index.html` 的 `<title>` 为 `my-website`，无任何 OG/Twitter 标签，`lang` 属性为 `"en"`。

## Goals / Non-Goals

**Goals:**
- 正确设置 `<title>`、`<meta name="description">`
- 添加 Open Graph 和 Twitter Card 标签，保证社交平台分享时展示正确信息
- 修改 `<html lang="zh-CN">` 以匹配页面语言
- 新增 `public/robots.txt` 允许爬虫并声明 sitemap
- 新增 `public/sitemap.xml` 声明站点唯一页面 URL
- 审查现有组件语义化 HTML，修正 heading 层级和 landmark 使用

**Non-Goals:**
- 动态 meta（per-route title/description）
- 自动化 sitemap 生成
- Google Analytics / Search Console 接入
- JSON-LD 结构化数据

## Decisions

### 1. 静态 meta 写入 index.html

**选择**：直接在 `index.html` `<head>` 中硬编码所有 meta 标签

**理由**：SPA 单页应用，无多路由，全站只有一个有意义的页面，静态写入零运行时开销，无需引入 React Helmet 等库。

**备选**：react-helmet-async → 引入依赖，增加 bundle size，对单页场景过度设计。

### 2. Open Graph 图片（og:image）

**选择**：暂不设置 `og:image`（待有真实分享图后补充）

**理由**：og:image 需要绝对 URL 且图片需提前准备，占位图分享效果差于不设置。不设置时平台会使用默认空白或自动抓取首屏。

### 3. robots.txt：允许全部爬虫

**选择**：`User-agent: * / Allow: /`

**理由**：个人品牌站的目标是最大化可发现性，无任何需要屏蔽的路径。

### 4. sitemap.xml：手动维护

**选择**：静态 `public/sitemap.xml`，只声明一条 URL（`https://<user>.github.io/my-website/`）

**理由**：SPA 单页，无需多条 URL；静态文件无需构建脚本。

### 5. 语义化 HTML 审查范围

**选择**：检查 `App.tsx`、`HeroSection.tsx`、`ProjectsSection.tsx`、`ProjectCard.tsx`、`Navbar.tsx` 的 landmark 和 heading 层级

**关注点**：
- `<header>` landmark 是否正确（Navbar 已用 `<header>`，✅）
- `<main>` landmark 缺失 → 需在 `App.tsx` 中包裹主体内容
- heading 层级：HeroSection `<h1>` ✅，ProjectsSection 标题为 `<h2>` ✅，ProjectCard 为 `<h3>` ✅

## Risks / Trade-offs

- **og:image 缺失** → 社交分享无预览图，可接受，后续补充
- **静态 sitemap** → URL 写死，部署域名变更时需手动更新；个人站域名稳定，风险极低
- **单页 SPA 对 SEO 本身有局限** → 搜索引擎对 JS 渲染的抓取能力参差不齐，静态 meta 是当前无 SSR 条件下的最优解

## Migration Plan

1. 修改 `index.html`（不影响运行时行为）
2. 新增静态文件（`robots.txt`、`sitemap.xml`）
3. 按需微调现有组件语义化标签

所有变更均向后兼容，无需回滚策略。
