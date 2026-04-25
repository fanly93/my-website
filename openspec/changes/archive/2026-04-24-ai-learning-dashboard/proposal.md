## Why

当前品牌站是纯展示型单页，缺乏交互工具。用户（包括作者本人）需要一个 AI 学习助手工作台，可通过品牌站发现并进入。现有架构（无路由、全锚点导航）无法支撑多功能工具页，需先建立路由层和 dashboard 骨架，以 mock 数据验证布局与交互，后续再接入真实后端。

## What Changes

- 引入 React Router v7，品牌站保留在 `/`，dashboard 新增在 `/dashboard`
- `App.tsx` 重构为路由根，现有品牌站内容迁移至 `HomePage`
- 新建 `DashboardLayout`：左侧固定导航栏 + 顶部栏 + 主内容区
- 新建 dashboard 首页，包含以下 widget（全部使用 mock 数据）：
  - 数据统计卡片（学习天数、完成题数、知识点掌握率、连续打卡天数）
  - 每日目标清单（可勾选，状态存 localStorage）
  - AI 建议学习面板（mock 推荐内容列表）
  - 问答区域（mock 历史问答展示）
  - 周 / 月趋势图（学习时长 + 题目完成量，使用 Recharts 或 Chart.js）
- 品牌站 HeroSection 新增「进入学习助手」入口按钮，链接至 `/dashboard`
- 复用：`useTheme`、`ThemeToggle`、`MouseTrail`、设计 token（violet 主色、dark mode）

## Capabilities

### New Capabilities

- `routing`：React Router 路由层，`/` 品牌站、`/dashboard` 工作台，含品牌站入口按钮
- `dashboard-layout`：dashboard 页面骨架，左侧导航栏 + 顶部栏 + 内容区，支持暗色模式
- `stats-overview`：四张数据统计卡片，展示学习概览指标（mock 数据）
- `daily-goals`：每日目标清单，支持勾选，状态持久化到 localStorage
- `learning-suggestions`：AI 建议学习面板，展示推荐内容列表（mock 数据）
- `qa-panel`：问答记录展示区，展示历史问答卡片（mock 数据）
- `trend-charts`：周 / 月趋势折线图，展示学习时长与完成题数（mock 数据）

### Modified Capabilities

（无，现有品牌站行为不变）

## Impact

- **新增依赖**：`react-router-dom` v7
- **新增依赖**：图表库（Recharts 或 Chart.js，待 design 阶段确定）
- **重构文件**：`src/App.tsx`（变为路由根）
- **新增文件**：`src/pages/HomePage.tsx`（品牌站内容）、`src/pages/DashboardPage.tsx`、`src/components/dashboard/` 目录下各 widget 组件
- **修改文件**：`src/components/HeroSection.tsx`（新增跳转按钮）
- **不影响**：`npm run build` 构建流程、GitHub Pages 部署、现有品牌站 UI

## Out of Scope（本次不做）

- 后端 API（FastAPI / SQLite）
- 真实 AI 功能（大模型调用、RAG 等）
- 用户认证 / 注册 / 登录
- 用户数据持久化（除 daily-goals 的 localStorage 外）
- 移动端响应式 dashboard（品牌站已有响应式，dashboard 桌面优先）
- 国际化（i18n）
- 权限系统

## 回滚方案

变更风险等级：**中**（涉及 App.tsx 路由重构）

回滚步骤：
1. `git revert` 该 change 的所有提交，或直接 `git checkout main -- src/App.tsx` 恢复入口文件
2. 移除 `react-router-dom` 依赖（`npm uninstall react-router-dom`）
3. 品牌站恢复正常运行，dashboard 路由失效（不影响品牌站访问）
