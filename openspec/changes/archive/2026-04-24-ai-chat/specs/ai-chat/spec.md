## ADDED Requirements

### Requirement: 前端提供气泡式 AI 对话页面

系统 SHALL 在 `/#/ai-chat` 渲染 AI 对话页，包含会话侧边栏、消息列表和输入框。用户消息显示在右侧，AI 消息显示在左侧，支持亮色 / 暗色模式。

#### Scenario: 进入页面加载最近会话

- **GIVEN** 用户已认证
- **WHEN** 访问 `/#/ai-chat`
- **THEN** 系统 SHALL 自动加载最近一个会话的历史消息；若无会话则自动创建新会话

#### Scenario: 发送消息并显示 AI 流式回复

- **GIVEN** 用户在对话页且已选中一个会话
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

---

### Requirement: AI 回复支持 Markdown 渲染

AI 消息内容 SHALL 使用 Markdown 渲染，代码块 SHALL 显示语言标注和语法高亮，行内代码使用等宽字体样式。

#### Scenario: 渲染代码块

- **WHEN** AI 回复包含 ``` 包裹的代码块
- **THEN** 系统 SHALL 渲染带语法高亮的代码块，并显示编程语言标签

#### Scenario: 渲染行内格式

- **WHEN** AI 回复包含粗体、斜体、行内代码
- **THEN** 系统 SHALL 正确渲染对应的 HTML 样式

---

### Requirement: 用户可管理对话会话

系统 SHALL 在页面左侧显示会话列表（最近 5 条），提供新建对话和删除会话功能。

#### Scenario: 新建会话

- **GIVEN** 用户在对话页
- **WHEN** 点击「新建对话」按钮
- **THEN** 系统 SHALL 调用 `POST /chat/sessions`，切换至新会话，清空消息列表

#### Scenario: 切换历史会话

- **GIVEN** 侧边栏显示多个会话
- **WHEN** 用户点击某个历史会话
- **THEN** 系统 SHALL 加载该会话的历史消息并显示在消息列表中

#### Scenario: 流式出错显示错误提示

- **WHEN** 流式请求失败（网络中断或后端错误）
- **THEN** 系统 SHALL 在消息列表显示错误提示，恢复输入框可用状态
