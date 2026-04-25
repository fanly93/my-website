## ADDED Requirements

### Requirement: Dashboard 首页展示四张统计卡片

系统 SHALL 在 dashboard 首页顶部展示四张统计卡片，呈现学习概览指标：累计学习天数、累计完成题数、知识点掌握率（百分比）、连续打卡天数，数据来自预设 mock 数据。

#### Scenario: 四张卡片在桌面端水平排列

- **WHEN** 用户在宽度 ≥ 1024px 的设备访问 dashboard 首页
- **THEN** 系统 SHALL 将四张卡片渲染为 4 列网格，每张卡片展示图标、指标名称、数值

#### Scenario: 卡片在窄屏下自适应换行

- **WHEN** 用户在宽度 < 1024px 的设备访问 dashboard
- **THEN** 四张卡片 SHALL 自适应为 2 列或 1 列布局，无内容截断

#### Scenario: 暗色模式下卡片样式正确

- **WHEN** 用户切换至暗色模式
- **THEN** 卡片背景、文字、图标颜色 SHALL 切换为深色配色，保持可读性

#### Scenario: 数值字段缺失时不崩溃

- **WHEN** 某张卡片的数值字段为 `undefined` 或 `null`
- **THEN** 系统 SHALL 显示占位符（如 `--`），不渲染崩溃或 NaN
