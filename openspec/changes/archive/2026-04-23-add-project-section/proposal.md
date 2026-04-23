## Why

个人品牌站目前只有 Hero Section，缺少展示具体作品的区域，访客无法了解开发者的项目经历和技术能力。添加项目展示区是将流量转化为认知的核心环节。

## What Changes

- **新增** `ProjectsSection` 组件：卡片式布局，展示至少 4 个项目，每张卡片含截图、名称、描述和 GitHub 链接
- **新增** `ProjectCard` 组件：单张项目卡片，含鼠标悬浮微特效（上浮 + 阴影增强）
- **修改** `HeroSection` CTA 按钮锚点：从 `#projects`（占位 section）保持不变，但对应的内容 section 由空占位替换为真实 `ProjectsSection`
- **修改** `App.tsx`：用 `<ProjectsSection />` 替换 `<section id="projects" className="min-h-screen" />`

## Capabilities

### New Capabilities

- `project-section`: 项目展示区，包含卡片网格布局、项目数据结构、悬浮动画效果

### Modified Capabilities

- `hero-section`: CTA 按钮锚点目标说明更新（原本指向空占位，现在指向真实内容 section）

## Impact

- **组件**：新增 `src/components/ProjectsSection.tsx`、`src/components/ProjectCard.tsx`
- **数据**：新增 `src/data/projects.ts`，存放项目静态数据
- **资源**：新增项目截图（`public/projects/` 目录），使用 lazy loading
- **App.tsx**：替换 projects 占位 section
- **无新依赖**：使用现有 Tailwind CSS 动画能力，无需引入新库

## Out of Scope

- 项目详情页（无路由跳转）
- 项目搜索/过滤功能
