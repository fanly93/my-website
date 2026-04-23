## Why

个人品牌站目前缺少基础 SEO 配置：`<title>` 仍为 Vite 默认值 `my-website`，无 `<meta description>`，无 Open Graph/Twitter Card 标签，也没有 `robots.txt`。搜索引擎和社交平台分享时无法正确呈现站点信息，直接影响可发现性和专业度。

## What Changes

- **修改** `index.html`：设置正确的 `<title>`、`<meta name="description">`、Open Graph 标签（`og:title`、`og:description`、`og:url`、`og:type`）、Twitter Card 标签、`<html lang="zh-CN">`
- **新增** `public/robots.txt`：允许所有爬虫抓取，声明 Sitemap 路径
- **审查并修复** 现有组件的语义化 HTML：检查 heading 层级、landmark 区域、`<article>`/`<section>` 使用是否正确
- **新增** `public/sitemap.xml`：静态 sitemap，声明页面 URL

## Capabilities

### New Capabilities

- `seo-metadata`: HTML head 中的 SEO 元数据配置（title、description、OG、Twitter Card）
- `web-discoverability`: robots.txt 和 sitemap.xml，控制爬虫行为与页面可发现性

### Modified Capabilities

无。现有组件逻辑不变，仅审查语义化 HTML。

## Impact

- **index.html**：增加 meta 标签，修改 `lang` 属性
- **public/**：新增 `robots.txt`、`sitemap.xml`
- **现有组件**：可能微调 HTML 标签（如调整 heading 层级），不影响样式和功能
- **无新依赖**：纯静态文件修改

## Out of Scope

- 动态 SEO（React Helmet / per-route meta 切换）
- 站点地图自动生成脚本
- Google Search Console / Analytics 接入
- 结构化数据（JSON-LD schema.org）
