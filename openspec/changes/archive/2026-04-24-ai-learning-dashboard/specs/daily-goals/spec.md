## ADDED Requirements

### Requirement: 展示每日目标清单

系统 SHALL 在 dashboard 首页展示当日学习目标列表，每条目标包含复选框、目标文字、预计时间（分钟），数据来自预设 mock 数据。

#### Scenario: 加载时展示目标列表

- **WHEN** 用户访问 dashboard 首页
- **THEN** 系统 SHALL 渲染预设目标列表，每条显示复选框和文字

#### Scenario: 目标列表为空时展示空状态

- **WHEN** 目标列表为空
- **THEN** 系统 SHALL 显示空状态提示文字，不渲染空列表容器

---

### Requirement: 目标勾选状态持久化至 localStorage

用户 SHALL 能够勾选/取消勾选目标，状态 SHALL 持久化，页面刷新后保持。

#### Scenario: 勾选目标后状态保留

- **WHEN** 用户勾选某条目标后刷新页面
- **THEN** 该目标 SHALL 保持已勾选状态，视觉显示为已完成样式

#### Scenario: 取消勾选恢复未完成状态

- **WHEN** 用户取消勾选已完成的目标
- **THEN** 该目标 SHALL 恢复未完成样式

#### Scenario: localStorage 不可用时降级处理

- **WHEN** localStorage 写入失败
- **THEN** 系统 SHALL 仍能正常渲染和勾选（仅会话内有效），不抛出未捕获错误
