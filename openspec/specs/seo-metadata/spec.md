# seo-metadata Specification

## Purpose
TBD - created by archiving change add-seo-optimization. Update Purpose after archive.
## Requirements
### Requirement: HTML 基础 Meta 标签

`index.html` 的 `<head>` SHALL 包含以下标签：
- `<html lang="zh-CN">`：声明页面语言为简体中文
- `<title>`：格式为「小林fanly — 软件工程师」
- `<meta name="description">`：80 字以内的站点描述，包含姓名和核心技能关键词
- `<meta name="author">`：作者姓名

#### Scenario: 搜索引擎抓取 title 和 description

- **WHEN** 搜索引擎爬虫抓取页面
- **THEN** `<title>` 为「小林fanly — 软件工程师」，`<meta name="description">` 存在且非空

#### Scenario: lang 属性正确（边界）

- **WHEN** 屏幕阅读器或语言检测工具扫描页面
- **THEN** `<html lang="zh-CN">` 声明语言为简体中文，而非默认 `"en"`

---

### Requirement: Open Graph 标签

`index.html` SHALL 包含 Open Graph 协议标签，用于社交平台（微信、Facebook 等）分享时正确展示站点信息：
- `og:type`：`website`
- `og:title`：与 `<title>` 一致
- `og:description`：与 `<meta name="description">` 一致
- `og:url`：站点完整 URL（`https://<user>.github.io/my-website/`）
- `og:locale`：`zh_CN`

#### Scenario: 微信/Facebook 分享链接

- **WHEN** 用户将站点 URL 粘贴至微信或 Facebook
- **THEN** 平台读取 og:title 和 og:description 并展示正确预览信息

#### Scenario: og:image 缺失降级（边界）

- **WHEN** `og:image` 标签不存在
- **THEN** 平台展示无图预览或自动抓取首屏，不报错

---

### Requirement: Twitter Card 标签

`index.html` SHALL 包含 Twitter Card 标签：
- `twitter:card`：`summary`
- `twitter:title`：与 `<title>` 一致
- `twitter:description`：与 `<meta name="description">` 一致

#### Scenario: Twitter 分享预览

- **WHEN** 用户在 Twitter/X 上分享站点链接
- **THEN** 显示 summary 卡片，标题和描述与 meta 标签一致

---

### Requirement: 语义化 HTML 结构

页面主体内容 SHALL 被 `<main>` landmark 包裹（`App.tsx` 中 Navbar `<header>` 之外的所有 section），确保屏幕阅读器可识别主内容区域。现有 heading 层级 SHALL 保持正确顺序：`<h1>`（HeroSection）→ `<h2>`（各 section 标题）→ `<h3>`（ProjectCard）。

#### Scenario: 屏幕阅读器导航 main landmark

- **WHEN** 屏幕阅读器用户使用 landmark 导航
- **THEN** 可通过 `<main>` 跳转至主内容区，跳过 Navbar

#### Scenario: heading 层级无跳级（边界）

- **WHEN** 可访问性审查工具扫描页面 heading 结构
- **THEN** heading 层级从 h1 顺序递进，不存在从 h1 直接跳至 h3 的情况

