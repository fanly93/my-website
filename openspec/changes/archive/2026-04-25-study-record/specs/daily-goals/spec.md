## MODIFIED Requirements

### Requirement: 展示每日目标清单

系统 SHALL 在学习记录页展示当日学习目标列表，每条目标包含复选框、目标文字、预计时间（分钟），数据来自后端 `GET /study/goals`（按日期过滤当日目标），不再使用 Mock 数据。

#### Scenario: 加载时展示目标列表

- **GIVEN** 用户已认证
- **WHEN** 访问学习记录页
- **THEN** 系统 SHALL 调用 `GET /study/goals?date=<today>`，渲染目标列表，每条显示复选框和文字

#### Scenario: 目标列表为空时展示空状态

- **WHEN** 当日目标列表为空
- **THEN** 系统 SHALL 显示空状态提示文字及「添加目标」入口，不渲染空列表容器

---

## ADDED Requirements

### Requirement: 用户可创建今日目标

系统 SHALL 提供 `POST /study/goals` 端点，接受目标文字和预计时长，创建归属当前用户的当日目标，返回新建目标对象。

#### Scenario: 创建目标成功

- **GIVEN** 用户在目标输入框填写文字并确认
- **WHEN** 调用 `POST /study/goals`，body 含 title、estimated_minutes
- **THEN** 系统 SHALL 返回 201 及新目标对象，前端追加至列表

#### Scenario: 目标文字为空时拒绝创建

- **WHEN** POST 请求 title 为空字符串
- **THEN** 系统 SHALL 返回 422，不写入数据库

---

### Requirement: 用户可编辑今日目标

系统 SHALL 提供 `PUT /study/goals/{id}` 端点，允许用户修改目标文字或预计时长，仅允许修改本人目标。

#### Scenario: 编辑目标成功

- **GIVEN** 目标属于当前用户
- **WHEN** 调用 `PUT /study/goals/{id}`，body 含更新字段
- **THEN** 系统 SHALL 返回 200 及更新后目标对象，前端更新列表对应条目

#### Scenario: 编辑他人目标被拒绝

- **GIVEN** 目标属于其他用户
- **WHEN** 调用 `PUT /study/goals/{id}`
- **THEN** 系统 SHALL 返回 404

---

### Requirement: 用户可删除今日目标

系统 SHALL 提供 `DELETE /study/goals/{id}` 端点，删除指定目标，仅允许删除本人目标，返回 204。

#### Scenario: 删除目标成功

- **GIVEN** 目标属于当前用户
- **WHEN** 调用 `DELETE /study/goals/{id}`
- **THEN** 系统 SHALL 返回 204，前端从列表移除该条目

#### Scenario: 删除他人目标被拒绝

- **GIVEN** 目标属于其他用户
- **WHEN** 调用 `DELETE /study/goals/{id}`
- **THEN** 系统 SHALL 返回 404

---

### Requirement: 目标完成状态持久化至后端

用户 SHALL 能够勾选/取消勾选目标，状态通过 `PATCH /study/goals/{id}/complete` 持久化到数据库，不再依赖 localStorage。

#### Scenario: 勾选目标后状态保留

- **GIVEN** 用户勾选某条目标
- **WHEN** 调用 `PATCH /study/goals/{id}/complete`，body 含 completed=true
- **THEN** 系统 SHALL 返回 200，页面刷新后保持已勾选状态

#### Scenario: 取消勾选恢复未完成状态

- **WHEN** 用户取消勾选，调用 PATCH completed=false
- **THEN** 系统 SHALL 返回 200，目标恢复未完成样式
