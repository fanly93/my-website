# web-discoverability Specification

## Purpose
TBD - created by archiving change add-seo-optimization. Update Purpose after archive.
## Requirements
### Requirement: robots.txt 爬虫配置

`public/robots.txt` SHALL 存在于站点根路径（部署后可通过 `/my-website/robots.txt` 访问），内容 SHALL 允许所有爬虫抓取所有路径，并声明 Sitemap 文件地址。

#### Scenario: 搜索引擎爬虫读取 robots.txt

- **WHEN** Googlebot 或其他搜索引擎爬虫请求 `robots.txt`
- **THEN** 返回 `User-agent: *` 和 `Allow: /`，爬虫被允许抓取全站

#### Scenario: Sitemap 声明（边界）

- **WHEN** 爬虫解析 `robots.txt`
- **THEN** `Sitemap:` 字段指向站点 `sitemap.xml` 的完整 URL

---

### Requirement: sitemap.xml 站点地图

`public/sitemap.xml` SHALL 存在，遵循 Sitemap 0.9 协议，声明站点首页 URL（`https://<user>.github.io/my-website/`），包含 `<lastmod>` 和 `<changefreq>` 字段。

#### Scenario: 搜索引擎读取 sitemap

- **WHEN** 搜索引擎爬虫请求 `sitemap.xml`
- **THEN** 返回合法的 XML sitemap，包含至少一条 `<url>` 条目

#### Scenario: sitemap URL 与实际部署地址一致（边界）

- **WHEN** 搜索引擎对比 sitemap 中的 URL 与实际页面 URL
- **THEN** URL 与 GitHub Pages 部署地址完全匹配，无 404

