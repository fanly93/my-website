## Phase 1. 数据层准备

- [x] 1.1 新增 `public/projects/` 目录，放入 4 张项目截图占位图（使用纯色 PNG 或 WebP，命名如 `project-1.png`）
- [x] 1.2 创建 `src/data/projects.ts`：定义 `Project` 接口（`id`, `name`, `description`, `imageUrl`, `githubUrl`），导出包含 4 个项目的 `PROJECTS` 数组

## Phase 2. ProjectCard 组件

- [x] 2.1 创建 `src/components/ProjectCard.tsx`：接收单个 `Project` 对象作为 prop
- [x] 2.2 实现卡片布局：截图区域（`aspect-video`，`<img loading="lazy">`，截图缺失时显示渐变占位背景）
- [x] 2.3 实现卡片文字区域：项目名称（`<h3>`）、描述文字
- [x] 2.4 实现 GitHub 链接：`target="_blank" rel="noopener noreferrer"`，带外链图标
- [x] 2.5 实现悬浮微特效：`hover:-translate-y-1 hover:shadow-xl transition-all duration-300`，亮/暗模式阴影适配

## Phase 3. ProjectsSection 组件

- [x] 3.1 创建 `src/components/ProjectsSection.tsx`：根元素为 `<section id="projects">`，包含区域标题「我的项目」
- [x] 3.2 实现响应式网格：`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6`，渲染 `PROJECTS.map(p => <ProjectCard key={p.id} project={p} />)`
- [x] 3.3 实现亮/暗模式 section 背景与文字配色

## Phase 4. App.tsx 整合

- [x] 4.1 在 `App.tsx` 中引入 `ProjectsSection`，将 `<section id="projects" className="min-h-screen" />` 替换为 `<ProjectsSection />`
- [x] 4.2 验证 Hero CTA 按钮点击后平滑滚动至项目展示区（锚点 `#projects` 不变，无需修改 `HeroSection.tsx`）
