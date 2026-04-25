## ADDED Requirements

### Requirement: 展示周 / 月学习趋势图

系统 SHALL 在 dashboard 首页展示趋势图表，可视化学习时长（分钟）和完成题数两个维度，支持按「本周」/ 「本月」Tab 切换时间范围，数据来自预设 mock 数据。

#### Scenario: 默认展示本周趋势

- **WHEN** 用户首次访问趋势图区域
- **THEN** 系统 SHALL 默认展示「本周」视图，X 轴为最近 7 天日期

#### Scenario: 切换至本月视图

- **WHEN** 用户点击「本月」Tab
- **THEN** 系统 SHALL 切换为最近 30 天数据

#### Scenario: 图表在暗色模式下配色正确

- **WHEN** 用户切换至暗色模式
- **THEN** 图表坐标轴文字和网格线 SHALL 切换为深色配色，数据线颜色保持高对比度可见

#### Scenario: 图表数据为空时展示空状态

- **WHEN** 当前时间范围内趋势数据为空数组
- **THEN** 系统 SHALL 显示空状态提示，不渲染空坐标轴或崩溃
