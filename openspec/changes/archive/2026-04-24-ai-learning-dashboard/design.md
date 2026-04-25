## Context

当前品牌站是 Vite + React 19 单页应用，无路由库，三个 section 通过 anchor hash 导航。引入 dashboard 需要：
1. 路由层（React Router v7）将品牌站与 dashboard 分离
2. 新的页面级布局容器（侧边栏 + 内容区），与品牌站滚动布局不兼容
3. 图表渲染能力（Recharts）
4. 全部使用 mock 数据，数据结构预留后端接入扩展点

## Goals / Non-Goals

**Goals:**
- 建立路由层，品牌站在 `/my-website/`，dashboard 在 `/my-website/dashboard`
- 实现 dashboard 骨架布局（侧边栏 + 顶栏 + 内容区），支持暗色模式
- 实现 5 个 dashboard widget（mock 数据）
- 品牌站 HeroSection 新增跳转入口
- 复用 `useTheme`、`ThemeToggle`、`MouseTrail`、设计 token

**Non-Goals:**
- 后端 API、认证、真实 AI 功能（见 proposal Out of Scope）
- 移动端响应式 dashboard

---

## 组件层级图

```
App.tsx  (路由根，持有 useTheme)
├── MouseTrail            [全局复用]
└── HashRouter
    └── Routes
        ├── Route path="/"
        │   └── HomePage
        │       ├── Navbar            [现有，不改]
        │       ├── HeroSection       [新增跳转按钮]
        │       ├── ProjectsSection   [现有，不改]
        │       └── AboutSection      [现有，不改]
        │
        └── Route path="/dashboard"
            └── DashboardLayout
                ├── DashboardSidebar
                │   ├── NavItem (首页概览)
                │   ├── NavItem (学习记录)
                │   ├── NavItem (问答历史)
                │   └── NavItem (设置)
                ├── DashboardTopBar
                │   └── ThemeToggle   [复用]
                └── <Outlet>
                    └── DashboardHome
                        ├── StatsOverview
                        │   ├── StatCard (学习天数)
                        │   ├── StatCard (完成题数)
                        │   ├── StatCard (掌握率)
                        │   └── StatCard (连续打卡)
                        ├── DailyGoals
                        │   └── GoalItem × N
                        ├── LearningPanel
                        │   └── SuggestionCard × N
                        ├── QaPanel
                        │   └── QaCard × N
                        └── TrendCharts
                            ├── WeeklyChart (Recharts LineChart)
                            └── MonthlyChart (Recharts BarChart)
```

---

## Decisions

### D1：路由库选择 React Router v7（非 TanStack Router）

**选择**：`react-router-dom` v7

**理由**：项目已在 Vite 生态，React Router v7 是该生态最主流选择，文档完善，后续迁移 Next.js 时路由约定相似。TanStack Router 类型安全更强但学习曲线更陡，对本项目当前阶段收益不明显。

**影响**：GitHub Pages 静态托管需在 `vite.config.ts` 中将 `base` 保持为 `/my-website/`，React Router 使用 `HashRouter`（而非 `BrowserRouter`）避免 404 问题——静态托管无法处理客户端路由的直接访问。

> 路由形态：`/#/` (品牌站)、`/#/dashboard` (dashboard)

---

### D2：图表库选择 Recharts（非 Chart.js）

**选择**：`recharts`

**理由**：Recharts 是 React 原生组件，天然支持 dark mode 主题色传入，无需操作 Canvas API，与 Tailwind 颜色 token 对接更自然。Chart.js 需要额外封装 React wrapper（`react-chartjs-2`），多一层抽象。

---

### D3：mock 数据放 `src/data/` 而非内联组件

**选择**：`src/data/dashboard.ts` 集中存放所有 mock 数据

**理由**：后续接入后端时只需替换数据来源，不需要改组件内部逻辑。数据结构定义同时作为与后端协商的 API contract 草稿。

---

### D4：dashboard 状态管理用 props（不引入 Redux/Zustand/Context）

**选择**：`DashboardLayout` 持有 sidebar 折叠 `useState`，通过 `onMenuClick` prop 传给 `DashboardTopBar`；`DailyGoals` 用 `useState` + `localStorage`

**理由**：当前 dashboard 状态简单（sidebar 开关 + 目标勾选），props 下传已足够，无需 Context 层。后续子页面增多、跨层通信复杂时再引入 Context 或轻量状态库。

---

## API 端点规范（Mock 阶段 — 数据结构草稿）

当前阶段无真实 API，以下为 mock 数据结构，同时作为后端接入时的接口契约参考：

```typescript
// GET /api/stats  →  StatsData
interface StatsData {
  studyDays: number        // 累计学习天数
  completedQa: number      // 累计完成题数
  masteryRate: number      // 知识点掌握率 0-100
  streakDays: number       // 连续打卡天数
}

// GET /api/goals/today  →  Goal[]
interface Goal {
  id: string
  text: string
  estimatedMinutes: number
  // completed 状态由客户端 localStorage 管理，后端不存储
}

// GET /api/suggestions  →  Suggestion[]
interface Suggestion {
  id: string
  title: string
  category: string         // e.g. "RAG", "Agent", "Prompt Engineering"
  estimatedMinutes: number
}

// GET /api/qa/history  →  QaRecord[]
interface QaRecord {
  id: string
  question: string
  answer: string
  createdAt: string        // ISO 8601
}

// GET /api/trends?period=week|month  →  TrendPoint[]
interface TrendPoint {
  date: string             // "YYYY-MM-DD"
  studyMinutes: number
  completedCount: number
}
```

---

## 文件结构

```
src/
├── pages/
│   ├── HomePage.tsx              # 品牌站内容（从 App.tsx 迁移）
│   ├── DashboardPage.tsx         # dashboard 路由入口，持有子路由
│   └── DashboardHome.tsx         # dashboard 首页内容，组合所有 widget
├── components/
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── DashboardTopBar.tsx
│   │   ├── StatsOverview.tsx
│   │   ├── StatCard.tsx
│   │   ├── DailyGoals.tsx
│   │   ├── GoalItem.tsx
│   │   ├── LearningPanel.tsx
│   │   ├── SuggestionCard.tsx
│   │   ├── QaPanel.tsx
│   │   ├── QaCard.tsx
│   │   └── TrendCharts.tsx
│   └── [现有组件保持不变]
├── data/
│   ├── projects.ts               # 现有，不变
│   └── dashboard.ts              # 新增，所有 mock 数据
└── App.tsx                       # 重构为路由根
```

---

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| HashRouter 影响 SEO | dashboard 不需要 SEO，品牌站在 `/#/` 下 Google 可索引 |
| Recharts bundle 体积（~150KB gz） | 仅在 dashboard 路由下加载，React.lazy 动态引入 TrendCharts |
| DailyGoals 状态仅存 localStorage，刷新后 mock 数据重置 | 明确文档说明，后续接入后端时替换 |
| App.tsx 重构影响品牌站 | 品牌站内容迁入 `HomePage.tsx` 后结构不变，风险可控 |

## Open Questions

- Q1：Dashboard 侧边栏是否需要折叠/展开功能？（影响布局复杂度）→ 建议 Phase 1 先实现固定展开，折叠作为后续 Change
- Q2：趋势图的时间维度切换（周/月）是 Tab 切换还是两个独立图表并排？→ 建议 Tab 切换，减少纵向空间占用
