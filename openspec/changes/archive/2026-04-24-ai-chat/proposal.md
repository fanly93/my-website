## Why

Dashboard 目前仅展示静态学习数据，用户无法与 AI 交互获取个性化建议。引入 AI 学习助手对话页面，让用户能基于自身学习记录与大模型实时对话，提升平台的核心学习价值。

## What Changes

**后端（新增）**
- 新增 `/chat/sessions` 和 `/chat/sessions/{id}/messages` REST API，用于管理对话会话与消息持久化
- 新增 `POST /chat/sessions/{id}/stream` 流式端点（Server-Sent Events），将 LLM 响应以 token 为单位实时推送给前端
- 支持三类 LLM Provider：DeepSeek、DashScope（阿里云）、OpenAI，通过 `backend/.env` 中已配置的 API Key 调用
- 构建 context 注入层：请求 LLM 前，将用户的学习统计数据（level、streak_days、学习目标）作为 system prompt 注入，生成个性化回复
- 新增数据表：`chat_sessions`、`chat_messages`，通过 Alembic 迁移

**前端（新增）**
- 新增 `src/pages/AIChatPage.tsx`：气泡式 ChatUI，支持用户消息与 AI 消息分列显示
- 使用 `EventSource` 消费 SSE 流式响应，实现打字机效果
- 消息列表自动滚动至最新消息
- AI 回复使用 `react-markdown` 渲染 Markdown（含代码块高亮）
- DashboardSidebar 新增「AI 助手」导航入口，路由至 `/#/ai-chat`

**修改（已有功能）**
- `routing`：新增 `/#/ai-chat` 受保护路由

## Capabilities

### New Capabilities

- `ai-chat`：AI 对话 UI——气泡消息列表、SSE 流式输入、Markdown 渲染、自动滚动、会话管理（新建 / 切换）
- `chat-history`：对话历史持久化——会话与消息存储至数据库，用户重新进入时恢复上下文
- `llm-integration`：多 Provider LLM 调用层——统一接口封装 DeepSeek / DashScope / OpenAI，流式响应输出，携带用户学习上下文的 system prompt

### Modified Capabilities

- `routing`：新增 `/#/ai-chat` 受保护路由入口

## Impact

- **新增后端文件**：`backend/app/routers/chat.py`、`backend/app/models/chat.py`、`backend/app/services/llm.py`、`backend/app/schemas/chat.py`、新 Alembic migration
- **新增前端文件**：`src/pages/AIChatPage.tsx`、`src/components/chat/`（MessageBubble、ChatInput、MessageList）
- **修改**：`src/App.tsx`（新增路由）、`src/components/dashboard/DashboardSidebar.tsx`（新增导航项）
- **新增前端依赖**：`react-markdown`、`react-syntax-highlighter`
- **后端依赖**：`openai`（兼容 DeepSeek / DashScope OpenAI-compatible API）、`httpx`
- **不影响**：前端构建流程、GitHub Pages 部署、现有 dashboard 功能

## Out of Scope（不做）

- 语音输入 / 语音合成
- 文件 / 图片上传
- 多模态（视觉理解）
- Provider 切换 UI（前端手动切换模型）
- 对话导出（PDF / Markdown 下载）
- 会话搜索 / 标签分类
- RAG / 知识库检索

## 回滚方案

风险等级：**低**（新增独立页面，不修改已有核心逻辑）

1. 删除 `AIChatPage.tsx` 及 `src/components/chat/`
2. 从 `App.tsx` 移除 `/#/ai-chat` 路由
3. 从 `DashboardSidebar.tsx` 移除导航入口
4. 停止后端 chat 相关路由（可直接注释 router 挂载）
5. `alembic downgrade` 回退 chat 表迁移
6. `npm run build` 验证构建正常
