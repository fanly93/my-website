## 1. 依赖安装与路由基础

- [x] 1.1 安装 `react-router-dom` v7（`npm install react-router-dom`）
- [x] 1.2 安装 `recharts`（`npm install recharts`）
- [x] 1.3 重构 `src/App.tsx`：引入 `HashRouter` + `Routes`，将现有品牌站三段式内容提取至 `src/pages/HomePage.tsx`
- [x] 1.4 在 `App.tsx` 中配置两条路由：`/` → `HomePage`，`/dashboard` → `DashboardPage`（占位组件），`*` → 重定向至 `/`
- [x] 1.5 验证：`npm run dev` 启动后，`/#/` 显示品牌站，`/#/dashboard` 显示占位文字，`/#/unknown` 重定向至 `/#/`；`npm run build` 无报错

## 2. 品牌站入口按钮

- [x] 2.1 在 `HeroSection.tsx` 中新增「进入学习助手」次要按钮（使用 `<Link to="/dashboard">` 或 `useNavigate`），样式与主 CTA 区分（outline 风格）
- [x] 2.2 验证：品牌站页面显示两个按钮，点击「进入学习助手」跳转至 `/#/dashboard`，无页面刷新

## 3. Dashboard 骨架布局

- [x] 3.1 创建 `src/components/dashboard/DashboardSidebar.tsx`：固定宽 240px，含 Logo 区、导航项列表（首页概览 active，其余占位）、底部「返回主页」链接
- [x] 3.2 创建 `src/components/dashboard/DashboardTopBar.tsx`：固定高 64px，含页面标题、`ThemeToggle`（复用现有组件）
- [x] 3.3 创建 `src/components/dashboard/DashboardLayout.tsx`：组合 Sidebar + TopBar + `<Outlet>`，内容区独立滚动，宽屏固定布局，窄屏（< 1024px）隐藏 Sidebar
- [x] 3.4 创建 `src/pages/DashboardPage.tsx`：作为 `/dashboard` 路由对应的入口，渲染 `DashboardLayout`
- [x] 3.5 验证：访问 `/#/dashboard` 显示三区域布局，暗色模式切换正常，内容区滚动 Sidebar 不跟随，「返回主页」链接跳转至 `/#/`

## 4. Mock 数据层

- [x] 4.1 创建 `src/data/dashboard.ts`，定义并导出所有 mock 数据：`STATS_DATA`、`GOALS`、`SUGGESTIONS`（≥5条）、`QA_HISTORY`（≥3条）、`WEEKLY_TREND`（7天）、`MONTHLY_TREND`（30天）
- [x] 4.2 为每个数据集定义对应的 TypeScript 接口（`StatsData`、`Goal`、`Suggestion`、`QaRecord`、`TrendPoint`），接口与 `design.md` API 规范一致
- [x] 4.3 验证：TypeScript 编译无类型错误（`npm run build`）

## 5. StatCards 统计卡片

- [x] 5.1 创建 `src/components/dashboard/StatCard.tsx`：接收 `icon`、`label`、`value`、`unit` props，支持暗色模式
- [x] 5.2 创建 `src/components/dashboard/StatsOverview.tsx`：4 列网格布局渲染四张 StatCard，使用 `STATS_DATA` mock 数据
- [x] 5.3 验证：dashboard 首页顶部显示四张卡片，数值与 mock 一致，窄屏自适应换行，暗色模式样式正确

## 6. DailyGoals 每日目标

- [x] 6.1 创建 `src/components/dashboard/GoalItem.tsx`：复选框 + 文字 + 时长，勾选后文字加删除线
- [x] 6.2 创建 `src/components/dashboard/DailyGoals.tsx`：渲染目标列表，勾选状态存 localStorage（key: `dashboard_goals_YYYY-MM-DD`），含空状态处理，localStorage 异常时降级处理
- [x] 6.3 验证：勾选目标后刷新页面状态保留，取消勾选恢复，mock 数据为空时显示空状态提示

## 7. LearningPanel 学习建议

- [x] 7.1 创建 `src/components/dashboard/SuggestionCard.tsx`：展示标题、分类标签（彩色 badge）、预计时长
- [x] 7.2 创建 `src/components/dashboard/LearningPanel.tsx`：展示最多 5 条建议，超出截断并显示「查看更多」（当前无跳转），面板标题标注「示例数据」
- [x] 7.3 验证：面板显示 ≤5 条建议，分类标签颜色区分，「示例数据」标注可见

## 8. QaPanel 问答记录

- [x] 8.1 创建 `src/components/dashboard/QaCard.tsx`：问题文字、回答摘要（超 100 字截断 + 展开/收起按钮）、相对时间（自实现或使用 `date-fns`）
- [x] 8.2 创建 `src/components/dashboard/QaPanel.tsx`：渲染问答列表，含空状态处理
- [x] 8.3 验证：长回答显示截断和「展开」按钮，点击展开显示全文，时间显示为相对格式，列表为空时显示空状态

## 9. TrendCharts 趋势图

- [x] 9.1 创建 `src/components/dashboard/TrendCharts.tsx`：使用 Recharts `LineChart`（周）和 `BarChart`（月），Tab 切换周/月视图，暗色模式配色适配
- [x] 9.2 在 `DashboardPage` 中通过 `React.lazy` + `Suspense` 引入 `TrendCharts`，Suspense fallback 使用骨架占位（简单灰色区域）
- [x] 9.3 验证：图表正确渲染 mock 数据，Tab 切换正常，暗色模式下坐标轴/网格可见，页面加载时其他 widget 不被图表阻塞

## 10. 集成与收尾

- [x] 10.1 在 `DashboardPage` 中组合所有 widget：`StatsOverview`、`DailyGoals`、`LearningPanel`、`QaPanel`、`TrendCharts`，确认布局间距和响应式
- [x] 10.2 运行 `npm run build`，确认无 TypeScript 错误、无 ESLint 报错、构建产物正常
- [ ] 10.3 在浏览器中走通完整路径：品牌站 → 点击入口 → dashboard → 切换暗色模式 → 勾选目标 → 刷新保持状态 → 返回品牌站
- [ ] 10.4 验证品牌站现有功能无回归：滚动导航、粒子背景、项目卡片、暗色切换均正常
