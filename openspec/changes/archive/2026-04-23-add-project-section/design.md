## Context

当前站点已有 Hero Section 和 Navbar，`App.tsx` 中有一个 `<section id="projects" className="min-h-screen" />` 占位元素。本次变更将该占位替换为真实的项目展示区，并新增卡片组件和静态项目数据。

技术约束：React 19 + TypeScript + Tailwind CSS v4，无路由库，部署到 GitHub Pages（base: `/my-website/`）。

## Goals / Non-Goals

**Goals:**
- 实现响应式卡片网格，展示至少 4 个项目
- 每张卡片含截图（lazy loading）、名称、描述、GitHub 链接
- 鼠标悬浮时有上浮 + 阴影增强的微特效
- 支持亮色/暗色模式
- Hero CTA 跳转到真实 section（锚点 `#projects` 不变，内容替换即可）

**Non-Goals:**
- 项目详情页、路由跳转
- 项目搜索/过滤

## Decisions

### 1. 数据层：静态 TypeScript 数据文件

**选择**：`src/data/projects.ts` 导出 `Project[]` 数组

**理由**：个人品牌站项目数量少且更新频率低，静态数据零运行时开销，无需 API 或 CMS。

**备选**：JSON 文件 / headless CMS → 过度设计，首屏加载增加异步请求。

### 2. 卡片悬浮特效：纯 Tailwind CSS

**选择**：`hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300`

**理由**：无额外 JS，GPU 加速 transform，与现有 Tailwind 风格一致。

**备选**：Framer Motion → 引入新依赖不划算；CSS keyframes → 需写自定义 CSS 而 Tailwind 已够用。

### 3. 截图资源：`public/projects/` 目录

**选择**：截图放在 `public/projects/` 下，`<img loading="lazy" />` 加载

**理由**：Vite build 后 `public/` 内容原样复制，路径简单；lazy loading 满足首屏 < 2s 要求。

**备选**：`src/assets/` + import → Vite 会打包进 bundle 并添加哈希，适合小图标，不适合项目截图大图。

### 4. 网格布局：CSS Grid + Tailwind 响应式断点

**选择**：`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4` 

**理由**：4 个项目在大屏一行展示，中屏两列，移动端单列，无需 JS 计算。

### 5. `ProjectCard` 与 `ProjectsSection` 分离

**选择**：拆分为两个组件文件

**理由**：`ProjectCard` 可独立测试和复用；`ProjectsSection` 负责布局和标题，职责清晰。

## Risks / Trade-offs

- **截图资源缺失** → 使用占位图（aspect-ratio 容器 + 渐变背景），待真实截图替换
- **项目数据硬编码** → 未来需要 CMS 时需重构数据层，但当前规模不值得提前抽象
- **悬浮特效在触摸设备无效** → 触摸设备没有 hover，但卡片内容仍完整展示，不影响功能

## Migration Plan

1. 在 `App.tsx` 中将 `<section id="projects" className="min-h-screen" />` 替换为 `<ProjectsSection />`
2. `ProjectsSection` 内部的根 `<section>` 携带 `id="projects"`，锚点不变，Hero CTA 无需修改代码逻辑

## Open Questions

- 无。截图占位方案已明确，项目数据由开发者填充。
