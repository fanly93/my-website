## Context

当前站点已有 Hero Section、Navbar 和 ProjectsSection，`App.tsx` 中有一个 `<section id="contact" className="min-h-screen" />` 占位元素。本次变更将该占位替换为「关于我」区域，复用现有主题系统，无需引入新依赖。

## Goals / Non-Goals

**Goals:**
- 左右两栏布局：左侧头像，右侧个人简介
- 底部社交链接：GitHub 图标链接 + 邮箱图标链接
- 支持亮色/暗色模式
- 头像图片 lazy loading，缺失时显示占位头像

**Non-Goals:**
- 联系我表单（用户无法提交信息）
- 动态内容/CMS 接入

## Decisions

### 1. 布局：两栏响应式

**选择**：`flex flex-col md:flex-row`，移动端单列，桌面端左右两栏

**理由**：头像 + 文字的经典个人介绍布局，Tailwind 响应式断点即可实现，无需额外库。

### 2. 头像资源：`public/avatar.jpg`

**选择**：头像放在 `public/` 根目录，`<img loading="lazy" />` 加载，路径为 `/my-website/avatar.jpg`

**理由**：与 ProjectsSection 截图保持一致的资源管理策略；单张图片无需子目录。头像缺失时显示渐变占位圆形（`rounded-full bg-gradient-to-br from-violet-600 to-indigo-600`）。

### 3. 社交链接：独立 `SocialLinks` 组件

**选择**：抽离为 `src/components/SocialLinks.tsx`，接收链接配置数组

**理由**：职责分离，未来增加 Twitter/LinkedIn 等只需修改数据，不改组件结构。

### 4. 社交数据：硬编码在组件内

**选择**：GitHub URL 和邮箱直接写在 `SocialLinks.tsx` 的数据数组中

**理由**：个人站点社交账号极少变动，无需抽成单独数据文件，保持简单。

### 5. section id：复用 `contact`

**选择**：`AboutSection` 根元素保留 `id="contact"`

**理由**：Navbar 已有「联系我」链接指向 `#contact`，复用锚点无需修改 Navbar 代码。「关于我」区域在语义上也承担了联系入口的职责。

## Risks / Trade-offs

- **头像图片缺失** → 圆形渐变占位背景兜底，待替换真实头像
- **`id="contact"` 语义略模糊** → 「关于我」和「联系我」合并为一个 section，对个人站点规模完全合理，不引入路由或多 section 过度设计

## Migration Plan

1. 在 `App.tsx` 中将 `<section id="contact" className="min-h-screen" />` 替换为 `<AboutSection />`
2. Navbar 中「联系我」链接 `#contact` 自动指向新 section，无需改动

## Open Questions

无。
