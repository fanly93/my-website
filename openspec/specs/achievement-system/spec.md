## Requirements

### Requirement: 后端维护成就定义与用户解锁状态

系统 SHALL 维护预设成就列表（hardcoded），并在 `user_achievements` 表记录每位用户的解锁时间。`GET /study/achievements` SHALL 返回所有成就及当前用户的解锁状态。

#### Scenario: 获取成就列表

- **GIVEN** 用户已认证
- **WHEN** 调用 `GET /study/achievements`
- **THEN** 系统 SHALL 返回 200，含所有成就对象（id、name、description、icon、unlocked、unlocked_at）

#### Scenario: 未解锁成就返回 unlocked=false

- **GIVEN** 用户尚未达成某成就条件
- **WHEN** 调用 `GET /study/achievements`
- **THEN** 该成就 SHALL 返回 unlocked=false，unlocked_at=null

#### Scenario: 已解锁成就返回解锁时间

- **GIVEN** 用户已解锁「连续打卡 7 天」成就
- **WHEN** 调用 `GET /study/achievements`
- **THEN** 该成就 SHALL 返回 unlocked=true 及对应 unlocked_at 时间戳

---

### Requirement: 成就解锁由系统自动触发

系统 SHALL 在以下事件后检查并自动解锁成就：用户完成 AI 对话、目标状态变更、打卡记录更新。已解锁成就不重复解锁。

预设成就里程碑：
- **初学者**：完成第 1 次 AI 对话
- **连续学习 7 天**：streak_days ≥ 7
- **连续学习 30 天**：streak_days ≥ 30
- **目标达人**：累计完成目标 10 个
- **对话达人**：累计完成 AI 对话 50 次

#### Scenario: 首次完成 AI 对话解锁初学者成就

- **GIVEN** 用户从未完成过 AI 对话
- **WHEN** 用户第一次完成 AI 消息流
- **THEN** 系统 SHALL 自动解锁「初学者」成就并记录时间

#### Scenario: 成就不重复解锁

- **GIVEN** 用户已解锁「初学者」成就
- **WHEN** 用户再次完成 AI 对话
- **THEN** 系统 SHALL 不重复写入解锁记录

---

### Requirement: 前端展示成就墙

系统 SHALL 在学习记录页展示成就墙，已解锁成就以彩色图标显示，未解锁以灰色锁定图标显示，悬停显示解锁条件描述。

#### Scenario: 成就墙渲染

- **WHEN** 用户访问学习记录页成就区域
- **THEN** 系统 SHALL 展示所有预设成就，已解锁与未解锁视觉区分，不崩溃

#### Scenario: 悬停显示成就描述

- **WHEN** 用户将鼠标悬停在某成就图标上
- **THEN** 系统 SHALL 显示 tooltip，含成就名称、解锁条件描述（及已解锁时间）
