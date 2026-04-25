## ADDED Requirements

### Requirement: 用户可在 AI Chat 页配置个人 LLM 参数

系统 SHALL 在 AI Chat 页 Header 提供齿轮图标按钮，点击后展开 LLMConfigModal，用于配置 Provider、API Key、Base URL（可选）和 Model。配置保存后立即生效。

#### Scenario: 打开配置 Modal

- **GIVEN** 用户在 AI Chat 页
- **WHEN** 点击 Header 右侧齿轮图标
- **THEN** 系统 SHALL 打开 LLMConfigModal，预填当前激活 Provider 的配置，并在后台加载所有已保存 Provider 配置（`GET /users/me/llm-configs`）用于切换预填

#### Scenario: 切换 Provider 时预填已保存配置

- **GIVEN** LLMConfigModal 已打开，用户之前已保存过 DashScope 配置
- **WHEN** 用户切换 Provider 下拉选项至 DashScope
- **THEN** 系统 SHALL 自动将 base_url 和 model 预填为该 Provider 上次保存的值；API Key 字段保持空白（显示已保存提示），无需重新输入

#### Scenario: 切换至未配置 Provider

- **GIVEN** LLMConfigModal 已打开，用户未配置过 OpenAI
- **WHEN** 用户切换 Provider 至 OpenAI
- **THEN** 系统 SHALL 将 base_url 重置为 OpenAI 默认值，model 重置为预设第一项，无已保存提示

#### Scenario: 选择预设模型

- **GIVEN** LLMConfigModal 已打开，用户选择 Provider 为 DashScope
- **WHEN** 用户从「预设模型」分组中选择 `qwen-max`
- **THEN** 系统 SHALL 将 `qwen-max` 填入 model 字段

#### Scenario: 从已保存自定义模型列表选择

- **GIVEN** LLMConfigModal 已打开，该 Provider 已有保存的自定义模型列表
- **WHEN** 用户从「已保存自定义」分组中选择某个模型
- **THEN** 系统 SHALL 将该模型名作为有效 model，无需显示文本输入框

#### Scenario: 新增自定义模型

- **GIVEN** LLMConfigModal 已打开
- **WHEN** 用户选择「＋ 新增自定义模型…」选项
- **THEN** 系统 SHALL 显示文本输入框，接受任意字符串；保存后该模型名追加至该 Provider 的 custom_models 列表，下次打开时可在「已保存自定义」分组中选择

#### Scenario: 保存配置成功

- **GIVEN** 用户填写了 provider、api_key、model
- **WHEN** 点击「保存」按钮
- **THEN** 系统 SHALL 调用 `PUT /users/me/llm-config`，成功后关闭 Modal 并显示 toast 提示「配置已保存」

---

### Requirement: 未配置 LLM 时 Chat 输入区禁用并引导配置

系统 SHALL 在用户未配置 LLM 凭据时，禁用消息输入框和发送按钮，并在 Chat 区域显示引导横幅，提示用户点击设置图标完成配置。

#### Scenario: 进入页面时检测配置状态

- **GIVEN** 用户访问 `/#/ai-chat`
- **WHEN** 页面加载完成
- **THEN** 系统 SHALL 调用 `GET /users/me/llm-config`；若返回 404，则禁用输入区并显示引导横幅

#### Scenario: 未配置时禁用输入

- **GIVEN** 用户尚未配置 LLM 凭据
- **WHEN** 用户尝试在输入框点击或输入
- **THEN** 系统 SHALL 保持输入框 disabled 状态，横幅提示「请先配置 API Key 后开始对话」

#### Scenario: 配置完成后恢复输入

- **GIVEN** 用户在 LLMConfigModal 中成功保存配置
- **WHEN** Modal 关闭
- **THEN** 系统 SHALL 更新配置状态，解除输入框禁用，横幅消失

## MODIFIED Requirements

### Requirement: 前端提供气泡式 AI 对话页面

系统 SHALL 在 `/#/ai-chat` 渲染 AI 对话页，包含会话侧边栏、消息列表、输入框和 Header 右侧的 LLM 配置入口（齿轮图标）。用户消息显示在右侧，AI 消息显示在左侧，支持亮色 / 暗色模式。

#### Scenario: 进入页面加载最近会话

- **GIVEN** 用户已认证
- **WHEN** 访问 `/#/ai-chat`
- **THEN** 系统 SHALL 自动加载最近一个会话的历史消息；若无会话则自动创建新会话

#### Scenario: 发送消息并显示 AI 流式回复

- **GIVEN** 用户在对话页且已选中一个会话，且已配置 LLM 凭据
- **WHEN** 用户输入消息并点击发送（或按 Enter）
- **THEN** 系统 SHALL 立即显示用户消息气泡，并开始以打字机效果逐步渲染 AI 回复

#### Scenario: 发送时禁用输入框

- **GIVEN** AI 正在流式回复中
- **WHEN** 回复尚未完成
- **THEN** 系统 SHALL 禁用输入框和发送按钮，防止并发请求

#### Scenario: 流式接收期间自动滚动

- **GIVEN** AI 回复正在逐步输出
- **WHEN** 新 token 追加到消息列表
- **THEN** 系统 SHALL 自动滚动到消息列表底部
