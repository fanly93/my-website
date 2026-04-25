## ADDED Requirements

### Requirement: Dashboard 页面采用固定三区域布局

系统 SHALL 将 dashboard 页面划分为左侧固定 Sidebar、顶部固定 TopBar、主内容区三个区域，内容区独立滚动。

#### Scenario: 布局在桌面端正确渲染

- **WHEN** 用户在宽度 ≥ 1024px 的设备访问 `/#/dashboard`
- **THEN** 系统 SHALL 渲染宽度 240px 的左侧 Sidebar、高度 64px 的顶部 TopBar、以及占据剩余空间的可滚动内容区

#### Scenario: 内容区独立滚动不影响 Sidebar

- **WHEN** 用户在内容区向下滚动
- **THEN** Sidebar 和 TopBar SHALL 保持固定位置

#### Scenario: 窄屏下 Sidebar 收起

- **WHEN** 用户在宽度 < 1024px 的设备访问 dashboard
- **THEN** Sidebar SHALL 默认隐藏，TopBar 展示菜单触发按钮

#### Scenario: 布局渲染失败时不白屏

- **WHEN** 某个 widget 子组件抛出渲染错误
- **THEN** Sidebar 和 TopBar SHALL 保持可见，错误区域显示占位提示，不整页崩溃

---

### Requirement: Dashboard 支持暗色模式

系统 SHALL 使 dashboard 所有区域随全局主题切换配色。

#### Scenario: 暗色模式下各区域配色正确

- **WHEN** 用户切换至暗色模式
- **THEN** Sidebar、TopBar、内容区背景和文字颜色 SHALL 切换为深色配色，文字和图标保持可读

#### Scenario: TopBar 中可切换主题

- **WHEN** 用户点击 TopBar 中的主题切换按钮
- **THEN** 系统 SHALL 切换全局主题，刷新后保持

---

### Requirement: Sidebar 提供主导航菜单

系统 SHALL 在 Sidebar 中展示导航项：首页概览、学习记录、问答历史、设置。除「首页概览」外其余为占位，不可跳转。

#### Scenario: 当前激活导航项高亮

- **WHEN** 用户当前在某一 dashboard 子页面
- **THEN** 对应导航项 SHALL 显示高亮样式

#### Scenario: 占位导航项点击无跳转

- **WHEN** 用户点击尚未实现的导航项
- **THEN** 系统 SHALL 不发生路由跳转
