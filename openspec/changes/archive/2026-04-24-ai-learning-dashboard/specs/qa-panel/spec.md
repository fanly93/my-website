## ADDED Requirements

### Requirement: 展示历史问答记录面板

系统 SHALL 在 dashboard 首页展示问答历史列表，每条记录包含问题文字、回答摘要、创建时间（相对格式），数据来自预设 mock 数据。

#### Scenario: 加载时展示问答列表

- **WHEN** 用户访问 dashboard 首页
- **THEN** 系统 SHALL 渲染预设问答列表，每条展示问题、回答摘要、相对时间

#### Scenario: 回答超长时截断并提示展开

- **WHEN** 某条回答文字超过 100 字符
- **THEN** 系统 SHALL 截断显示并附「展开」按钮；点击后显示完整内容，按钮变为「收起」

#### Scenario: 时间显示为相对时间

- **WHEN** 渲染问答记录
- **THEN** 时间字段 SHALL 以相对格式显示（如「3 小时前」「昨天」），不显示原始时间戳

#### Scenario: 问答列表为空时展示空状态

- **WHEN** 问答列表为空
- **THEN** 系统 SHALL 显示空状态提示，不渲染空列表容器
