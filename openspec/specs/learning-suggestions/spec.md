## Requirements

### Requirement: 展示 AI 建议学习面板

系统 SHALL 在学习记录页展示 AI 个性化学习建议列表，每条建议包含标题、分类标签、预计学习时长（分钟）。数据来自后端 `GET /study/suggestions`（调用用户已配置的 LLM），不再使用 Mock 数据，也不再显示「示例数据」标注。

#### Scenario: 加载时展示 AI 生成建议

- **GIVEN** 用户已认证且已配置 LLM 凭据
- **WHEN** 访问学习记录页
- **THEN** 系统 SHALL 调用 `GET /study/suggestions`，渲染返回的建议列表（最多 5 条）

#### Scenario: 未配置 LLM 时显示引导

- **GIVEN** 用户未配置 LLM 凭据
- **WHEN** 调用 `GET /study/suggestions`
- **THEN** 系统 SHALL 返回 400，前端显示「请先在 AI Chat 页配置 API Key」引导

#### Scenario: 建议条目超过 5 条时截断显示

- **WHEN** LLM 返回超过 5 条建议
- **THEN** 系统 SHALL 仅展示前 5 条，并显示「查看更多」入口

#### Scenario: 建议列表为空时展示空状态

- **WHEN** LLM 返回空列表或生成失败
- **THEN** 系统 SHALL 显示空状态提示，不渲染空容器

---

### Requirement: 后端调用 LLM 生成个性化学习建议

系统 SHALL 提供 `GET /study/suggestions` 端点，从数据库读取用户的激活 LLM 配置，结合用户学习数据（level、streak_days、近期对话主题）构建 prompt，调用 LLM 生成结构化建议列表，结果缓存 1 小时。

#### Scenario: 成功生成建议

- **GIVEN** 用户已配置 LLM 凭据（is_active=True）
- **WHEN** 调用 `GET /study/suggestions`
- **THEN** 系统 SHALL 返回 200，含 suggestions 数组（每项含 title、category、estimated_minutes）

#### Scenario: 1 小时内命中缓存

- **GIVEN** 用户 1 小时内已生成过建议
- **WHEN** 再次调用 `GET /study/suggestions`
- **THEN** 系统 SHALL 直接返回缓存结果，不重新调用 LLM

#### Scenario: LLM 调用失败时返回错误

- **WHEN** LLM API 返回错误或超时
- **THEN** 系统 SHALL 返回 502，前端显示「建议生成失败，请稍后重试」，不崩溃
