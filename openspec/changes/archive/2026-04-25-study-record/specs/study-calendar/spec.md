## ADDED Requirements

### Requirement: 学习日历展示每日打卡热力图

系统 SHALL 提供 `GET /study/calendar?year=<year>&month=<month>` 端点，返回当月每日的打卡状态与学习时长（分钟）。前端 SHALL 以月视图热力图渲染，按学习时长深浅着色，未打卡日显示为空格。

#### Scenario: 获取当月日历数据

- **GIVEN** 用户已认证
- **WHEN** 调用 `GET /study/calendar?year=2026&month=4`
- **THEN** 系统 SHALL 返回 200，含该月每日对象数组（date、duration_minutes、checked_in）

#### Scenario: 渲染热力图着色

- **GIVEN** 某日学习时长 > 0
- **WHEN** 渲染日历格
- **THEN** 系统 SHALL 按时长分 4 档深浅着色（0/1-30/31-60/60+分钟），暗色模式下保持对比度

#### Scenario: 未来日期不显示数据

- **WHEN** 请求月份包含未来日期
- **THEN** 未来日期格 SHALL 显示为空，不显示任何着色

#### Scenario: 无数据月份正常渲染

- **GIVEN** 用户当月无任何打卡记录
- **WHEN** 渲染日历
- **THEN** 系统 SHALL 渲染完整月视图，所有日期显示为空格，不崩溃

---

### Requirement: 用户打卡记录自动追踪

系统 SHALL 在用户每次发送 AI 消息时，自动在 `study_logs` 表写入或更新当日打卡记录（若当日已有则累加时长）。打卡无需用户主动触发。

#### Scenario: 发送消息后当日打卡自动记录

- **GIVEN** 用户发送一条 AI 消息，预估耗时 5 分钟
- **WHEN** 消息流结束写入数据库
- **THEN** 系统 SHALL 在 `study_logs` 中插入或更新当日记录（checked_in=True，累加 duration_minutes）

#### Scenario: 同一天多次发送累加时长

- **GIVEN** 用户当日已有打卡记录 duration_minutes=20
- **WHEN** 用户再次发送消息（+10 分钟）
- **THEN** 系统 SHALL 将当日记录更新为 duration_minutes=30，不新增行
