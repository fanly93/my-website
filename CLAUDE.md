# CLAUDE.md — OpenSpec 工作流规则

## 项目信息

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器
npm run build      # 构建生产包
```

访问地址：
- 品牌站：http://localhost:5173/my-website/#/
- Dashboard：http://localhost:5173/my-website/#/dashboard

关键路径：
- 入口：`src/App.tsx`（路由根）
- 品牌站页面：`src/pages/HomePage.tsx`
- Dashboard 页面：`src/pages/DashboardHome.tsx`
- Dashboard 组件：`src/components/dashboard/`
- Mock 数据：`src/data/dashboard.ts`

## 核心纪律

1. **先读后做**：执行任何 OpenSpec 命令前，先读取：
   - openspec/config.yaml（项目约束）
   - openspec/specs/ 目录下相关域的规范（当前系统行为）
   - openspec/changes/ 当前活跃的变更（如果存在）

2. **不要猜测需求**：如果 spec 中没有明确定义某个行为，一定要先问我，不要自行补充。

3. **out-of-scope 是红线**：proposal.md 中标注为 out-of-scope 的功能，严禁实现。

## OpenSpec 协作规则

### 分阶段交互（防止错上加错）

在执行 /opsx:apply 时：

1. 每完成一个 phase 停下来
2. 总结当前阶段的变更（改了哪些文件、新增了什么）
3. 等待我 review 确认后再继续下一个 phase
4. 如果发现偏差，立即停止并说明问题

严禁一次性实现所有任务。

### 复用优先

- 优先使用已有组件和服务
- 新建文件前先搜索是否有可复用的
- 不创建重复的 utility 函数

### 命名一致性

- Change 用 domain-based naming（如 user-auth、ai-chat），不用 feature-level naming（如 add-sidebar、fix-layout）
- Spec 按业务域组织（如 ui/、auth/、ai/），每个域下按 capability 命名
- React 组件用 PascalCase
- API 端点用 kebab-case
- 数据库表用 snake_case

## 代码标准

- 所有组件使用 TypeScript + 函数式组件
- 样式全部使用 Tailwind CSS，禁止内联 style
- 支持暗色模式（dark: 前缀）
- 所有图片使用 lazy loading
- 组件文件名使用 PascalCase
