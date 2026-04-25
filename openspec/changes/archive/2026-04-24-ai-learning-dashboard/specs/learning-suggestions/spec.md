## ADDED Requirements

### Requirement: 展示 AI 建议学习面板

系统 SHALL 在 dashboard 首页展示学习建议列表，每条建议包含标题、分类标签（如 RAG、Agent、Prompt Engineering）、预计学习时长（分钟）。面板 SHALL 标注「示例数据」以区分真实 AI 输出，数据来自预设 mock 数据。

#### Scenario: 加载时展示建议列表

- **WHEN** 用户访问 dashboard 首页
- **THEN** 系统 SHALL 渲染预设建议列表，每条展示标题、分类标签、预计时长

#### Scenario: 分类标签使用视觉区分色

- **WHEN** 渲染建议列表
- **THEN** 不同分类标签 SHALL 使用不同背景色区分，暗色模式下保持可见

#### Scenario: 建议条目超过 5 条时截断显示

- **WHEN** 建议条数 > 5
- **THEN** 系统 SHALL 仅展示前 5 条，并显示「查看更多」入口

#### Scenario: 建议列表为空时展示空状态

- **WHEN** 建议列表为空
- **THEN** 系统 SHALL 显示空状态提示，不渲染空容器
