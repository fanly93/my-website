## Context

Dashboard 已有用户认证（JWT）和学习数据（level、streak_days、学习目标），但缺少与 AI 的实时交互入口。本变更在现有 FastAPI 后端基础上新增流式 AI 对话能力，前端新增独立对话页面，复用现有 Auth 和 apiFetch 基础设施。

## Goals / Non-Goals

**Goals:**
- 气泡式 ChatUI，AI 回复支持 Markdown + 代码块渲染
- 后端 SSE 流式推送，前端打字机效果
- 对话历史持久化到数据库，支持多会话管理
- 个性化：将用户学习数据注入 LLM system prompt
- 支持 DeepSeek / DashScope / OpenAI 三类 Provider

**Non-Goals:**
- 语音输入 / 文件上传 / 多模态
- 前端 Provider 手动切换 UI
- 对话导出 / 搜索 / 标签
- RAG / 知识库

## Decisions

### 决策 1：流式协议选 SSE（Server-Sent Events）而非 WebSocket

**选择**：SSE

**理由**：AI 回复是单向流（服务器 → 客户端），SSE 天然契合；FastAPI 原生支持 `StreamingResponse`；前端用标准 `EventSource` 即可，无需额外库。WebSocket 双向能力在此场景属于过度设计，且对 CORS 处理更复杂。

**实现**：`POST /chat/sessions/{id}/stream` 返回 `text/event-stream`，每个 token 推送 `data: <token>\n\n`，流结束时推送 `data: [DONE]\n\n`。

> 注：POST 触发流，非 GET —— 避免 EventSource 不支持 body 的问题。前端改用 `fetch` + `ReadableStream` 替代 `EventSource`。

### 决策 2：统一使用 openai Python SDK 调用三类 Provider

**选择**：`openai` SDK（`AsyncOpenAI`）

**理由**：DeepSeek 和 DashScope 均提供 OpenAI-compatible API endpoint，只需切换 `base_url` 和 `api_key`；使用同一套 SDK 代码路径，无需分别维护三套客户端。

**Provider 配置（backend/.env）**：
```
DEEPSEEK_API_KEY=...
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DASHSCOPE_API_KEY=...
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_API_KEY=...
DEFAULT_PROVIDER=deepseek
DEFAULT_MODEL=deepseek-chat
```

**备选方案**：httpx 直接调用 — 被排除，需手动处理 SSE 解析。

### 决策 3：System prompt 在会话创建时注入，不在每次消息时重建

**选择**：会话创建时生成 system prompt，存入 `chat_sessions.system_prompt` 字段

**理由**：用户学习数据在会话期间不会频繁变化；每次消息重查 DB 增加延迟；存储 system prompt 便于后续 debug 和审计。

**System prompt 结构**：
```
你是用户的 AI 学习助手。用户信息如下：
- 当前等级：Lv.{level}
- 连续学习天数：{streak_days} 天
请结合用户的学习进度，给出个性化、有针对性的建议。
```

### 决策 4：消息在流完成后整体写入 DB，不逐 token 写入

**选择**：流结束后 `await db.commit()` 一次性写入完整 AI 消息

**理由**：逐 token 写入 DB 会造成大量小事务，显著影响性能；SSE 断线重连场景下，前端可通过 GET 历史消息接口恢复，不依赖 token 级持久化。

### 决策 5：前端会话管理策略

进入 `/#/ai-chat` 时自动加载最近一个会话（若无则创建新会话），侧边栏显示最近 5 个会话列表，点击可切换，顶部提供「新建对话」按钮。

## API 端点规范

```
POST   /chat/sessions                   创建新会话（返回 session_id）
GET    /chat/sessions                   获取当前用户的会话列表
GET    /chat/sessions/{id}/messages     获取指定会话的历史消息
POST   /chat/sessions/{id}/messages/stream   发送消息并流式获取 AI 回复
DELETE /chat/sessions/{id}              删除指定会话
```

### 数据模型

```
chat_sessions
  id           UUID PK
  user_id      UUID FK → users.id
  title        TEXT (默认取第一条用户消息前 20 字)
  system_prompt TEXT
  created_at   DATETIME

chat_messages
  id           UUID PK
  session_id   UUID FK → chat_sessions.id
  role         TEXT ('user' | 'assistant')
  content      TEXT
  created_at   DATETIME
```

## 组件层级图

```
AIChatPage
├── ChatSessionSidebar          会话列表 + 新建按钮
├── MessageList                 消息列表容器（auto-scroll）
│   └── MessageBubble           单条消息气泡（user / assistant）
│       └── ReactMarkdown       AI 消息的 Markdown 渲染
└── ChatInput                   输入框 + 发送按钮
```

## Risks / Trade-offs

- **SSE 与代理/防火墙**：部分代理会缓冲 SSE 响应导致打字机效果失效 → 后端设置 `Cache-Control: no-cache`，`X-Accel-Buffering: no`
- **流中断处理**：网络抖动导致 stream 断开时，前端显示已接收内容 + 错误提示，用户可手动重发 → 不自动重试（避免重复消费 LLM token）
- **长上下文费用**：历史消息全量传入 LLM 会随会话增长导致 token 费用上升 → 初期不做截断，后续可加「最近 N 条」限制
- **SQLite 并发**：多用户同时流式写入时 SQLite 可能出现锁等待 → 当前单用户场景可接受，后续迁移 PostgreSQL 时无需改动 ORM 层

## Migration Plan

1. 执行 `alembic revision --autogenerate -m "add_chat_tables"` 生成迁移脚本
2. 执行 `alembic upgrade head` 创建 `chat_sessions`、`chat_messages` 表
3. 在 `backend/app/main.py` 中挂载 chat router
4. 前端新增 `react-markdown`、`react-syntax-highlighter` 依赖
5. 部署后无需数据迁移（全新表）

**回滚**：注释 chat router 挂载 + `alembic downgrade -1`，前端构建不受影响
