## 1. 后端数据模型与迁移

- [x] 1.1 创建 `backend/app/models/chat.py`，定义 `ChatSession`（id UUID、user_id FK、title、system_prompt、created_at）和 `ChatMessage`（id UUID、session_id FK、role、content、created_at）ORM 模型
- [x] 1.2 生成 Alembic 迁移脚本：`alembic revision --autogenerate -m "add_chat_tables"`，检查 upgrade / downgrade 函数
- [x] 1.3 执行 `alembic upgrade head`，验证 `chat_sessions`、`chat_messages` 表已创建

## 2. 后端 Pydantic Schemas

- [x] 2.1 创建 `backend/app/schemas/chat.py`：`ChatSessionCreate`、`ChatSessionResponse`（id、title、created_at）、`ChatMessageResponse`（id、role、content、created_at）、`SendMessageRequest`（content: str）
- [x] 2.2 验证：Python 导入 chat schema 模块无报错

## 3. LLM 集成服务

- [x] 3.1 在 `backend/app/config.py` 中新增 LLM 相关配置：`DEFAULT_PROVIDER`、`DEFAULT_MODEL`、`DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL`、`DASHSCOPE_API_KEY`、`DASHSCOPE_BASE_URL`、`OPENAI_API_KEY`；缺失活跃 Provider 的 API Key 时启动报错
- [x] 3.2 创建 `backend/app/services/llm.py`：按 `DEFAULT_PROVIDER` 初始化 `AsyncOpenAI` 客户端（切换 `base_url` 和 `api_key`），实现 `stream_chat(messages, system_prompt)` 异步生成器，逐 token yield 字符串
- [x] 3.3 验证：在 Python shell 中调用 `stream_chat` 可流式获取 LLM 回复

## 4. 后端 Chat 路由

- [x] 4.1 创建 `backend/app/routers/chat.py`，实现 `POST /chat/sessions`：查询用户 profile 生成 system prompt，创建会话，返回 201 及 `ChatSessionResponse`
- [x] 4.2 实现 `GET /chat/sessions`：返回当前用户会话列表，按 created_at 倒序，最多 20 条
- [x] 4.3 实现 `GET /chat/sessions/{id}/messages`：校验会话归属当前用户（404 if not），返回消息列表按 created_at 正序
- [x] 4.4 实现 `POST /chat/sessions/{id}/messages/stream`：写入用户消息 → 构建 messages 列表 → 调用 `stream_chat` → 以 SSE 格式逐 token 推送 → 流结束后写入完整 AI 消息并更新会话 title（若为第一条消息）
- [x] 4.5 实现 `DELETE /chat/sessions/{id}`：校验归属，级联删除消息，返回 204
- [x] 4.6 在 `backend/app/main.py` 中挂载 chat router：`app.include_router(chat.router)`
- [x] 4.7 验证：通过 `/docs` 测试完整流程——创建会话 → 发送消息流式响应 → 获取历史 → 删除会话

## 5. 前端依赖与工具

- [x] 5.1 安装前端依赖：`npm install react-markdown react-syntax-highlighter @types/react-syntax-highlighter`
- [x] 5.2 验证：`npm run build` 无报错

## 6. 前端 Chat 组件

- [x] 6.1 创建 `src/components/chat/MessageBubble.tsx`：接收 `role`（'user' | 'assistant'）和 `content` props；用户消息右对齐蓝色气泡，AI 消息左对齐灰色气泡；AI 消息使用 `ReactMarkdown` + `SyntaxHighlighter` 渲染
- [x] 6.2 创建 `src/components/chat/MessageList.tsx`：渲染消息列表，消息更新时自动滚动到底部（`useRef` + `scrollIntoView`）；流式回复时显示「AI 正在输入…」占位
- [x] 6.3 创建 `src/components/chat/ChatInput.tsx`：textarea 输入框（按 Enter 发送，Shift+Enter 换行）+ 发送按钮，接收 `onSend`、`disabled` props；亮色 / 暗色模式均可见
- [x] 6.4 创建 `src/components/chat/ChatSessionSidebar.tsx`：显示会话列表（最近 5 条），高亮当前会话；「新建对话」按钮；会话项显示 title 和时间，点击触发切换

## 7. 前端 AI 对话页面

- [x] 7.1 创建 `src/pages/AIChatPage.tsx`：初始化时调用 `GET /chat/sessions`，若有会话则加载最新一条，否则调用 `POST /chat/sessions` 创建；组合 `ChatSessionSidebar`、`MessageList`、`ChatInput`
- [x] 7.2 实现流式发送逻辑：调用 `POST /chat/sessions/{id}/messages/stream`，使用 `fetch` + `ReadableStream` 逐行解析 SSE，实时追加到 AI 消息气泡；遇到 `[DONE]` 结束；遇到 `[ERROR]` 显示错误提示
- [x] 7.3 实现会话切换：点击侧边栏会话后调用 `GET /chat/sessions/{id}/messages` 加载历史消息，更新当前消息列表
- [x] 7.4 实现新建对话：调用 `POST /chat/sessions`，切换到新会话，清空消息列表，侧边栏刷新
- [x] 7.5 验证：发送消息可看到流式打字机效果；切换会话历史消息正确加载；Markdown + 代码块正常渲染

## 8. 路由与导航集成

- [x] 8.1 在 `src/App.tsx` 中新增 `/#/ai-chat` 路由，置于 `ProtectedRoute` 下，渲染 `AIChatPage`
- [x] 8.2 在 `src/components/dashboard/DashboardSidebar.tsx` 中新增「AI 助手」导航项，使用合适图标，链接至 `/#/ai-chat`，与当前路由高亮逻辑保持一致
- [x] 8.3 验证：从 Dashboard 点击「AI 助手」可跳转至对话页；未认证状态访问 `/#/ai-chat` 被重定向至登录页

## 9. 端到端验证

- [x] 9.1 完整流程：登录 → 进入 AI 助手 → 发送消息 → 看到流式回复 → 切换 / 新建会话 → 刷新页面历史仍在
- [x] 9.2 错误场景：后端停止时前端显示错误提示而非崩溃
- [x] 9.3 `npm run build` 无报错，`dist/` 正常生成
