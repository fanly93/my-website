## Phase 1. index.html Meta 标签

- [x] 1.1 将 `<html lang="en">` 改为 `<html lang="zh-CN">`
- [x] 1.2 将 `<title>` 改为「小林fanly — 软件工程师」
- [x] 1.3 添加 `<meta name="description">` 和 `<meta name="author">`
- [x] 1.4 添加 Open Graph 标签：`og:type`、`og:title`、`og:description`、`og:url`、`og:locale`
- [x] 1.5 添加 Twitter Card 标签：`twitter:card`、`twitter:title`、`twitter:description`

## Phase 2. 爬虫与站点地图

- [x] 2.1 创建 `public/robots.txt`：`User-agent: *`、`Allow: /`、`Sitemap:` 指向完整 URL
- [x] 2.2 创建 `public/sitemap.xml`：Sitemap 0.9 格式，声明站点首页 URL、`<lastmod>`、`<changefreq>`

## Phase 3. 语义化 HTML 审查与修复

- [x] 3.1 在 `App.tsx` 中用 `<main>` 包裹 Navbar 以外的所有内容（HeroSection、ProjectsSection、AboutSection 占位）
- [x] 3.2 检查并确认 heading 层级正确：`h1`（HeroSection）→ `h2`（section 标题）→ `h3`（ProjectCard）
