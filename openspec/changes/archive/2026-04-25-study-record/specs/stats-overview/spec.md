## MODIFIED Requirements

### Requirement: Dashboard 首页展示四张统计卡片

系统 SHALL 在 dashboard 首页顶部展示四张统计卡片，呈现学习概览指标：累计学习天数、累计 AI 对话次数、连续打卡天数、已完成目标数，数据来自后端 `GET /study/stats` 聚合结果，不再使用 Mock 数据。

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

---

## ADDED Requirements

### Requirement: 后端提供学习统计聚合数据

系统 SHALL 提供 `GET /study/stats` 端点，从数据库实时聚合当前用户的学习统计数据并返回。

#### Scenario: 获取统计数据成功

- **GIVEN** 用户已认证
- **WHEN** 调用 `GET /study/stats`
- **THEN** 系统 SHALL 返回 200，含以下字段：total_study_days（学习天数）、total_chat_sessions（AI 对话次数）、streak_days（连续打卡天数）、completed_goals（已完成目标数）

#### Scenario: 新用户无数据时返回零值

- **GIVEN** 用户刚注册，无任何学习记录
- **WHEN** 调用 `GET /study/stats`
- **THEN** 系统 SHALL 返回 200，所有字段均为 0，不返回 null 或 404

#### Scenario: streak_days 计算正确

- **GIVEN** 用户连续打卡 5 天，昨日有打卡记录
- **WHEN** 调用 `GET /study/stats`
- **THEN** streak_days SHALL 返回 5；若今日已打卡则包含今日，否则连续计算至昨日
