## Context

当前 LLM 凭据（API Key、Provider、Model）由服务端 `.env` 全局配置，所有用户共享。这不符合多租户需求：每位用户应使用自己的 API Key，平台不承担任何 LLM 费用。本变更将 LLM 凭据从服务端全局配置迁移至每位用户在 AI Chat 页内自行管理的个人配置，存储于后端数据库。

## Goals / Non-Goals

**Goals:**
- 每位用户独立存储自己的 LLM Provider / API Key / Base URL / Model
- 用户通过 AI Chat 页内设置面板进行配置
- 未配置时 Chat 功能完全禁用，引导用户先完成配置
- 流式聊天端点强制使用用户个人凭据，无全局回退

**Non-Goals:**
- API Key 加密存储
- 每用户多套配置切换
- 用量统计 / 计费
- API Key 有效性预校验（仅发消息时报错）

## Decisions

### 决策 1：数据模型使用独立 `user_llm_configs` 表，按 Provider 分行存储

**选择**：独立表，`(user_id, provider)` 联合 UNIQUE 约束，每用户每 Provider 一行；`is_active` 布尔列标记当前激活的 Provider；PUT 端点按 Provider 做 upsert，保存时将该 Provider 置为 `is_active=True`，其余置 `False`

**数据模型**：
```
user_llm_configs
  id             UUID PK
  user_id        UUID FK → users.id (CASCADE DELETE)
  provider       TEXT ('deepseek' | 'dashscope' | 'openai')
  api_key        TEXT
  base_url       TEXT
  model          TEXT
  is_active      BOOLEAN DEFAULT False
  custom_models  TEXT (JSON 数组，累积该 Provider 所有自定义模型名)
  updated_at     DATETIME
  UNIQUE (user_id, provider)
```

**custom_models 语义**：每次保存非预设模型时追加到列表（不重复、不清除历史）；GET 响应中返回，供前端在「已保存自定义」分组中展示供选择。

**理由**：用户切换 Provider 时无需重新输入 API Key，上次保存的配置（base_url、model、custom_models）完整保留；`is_active` 明确标识当前生效的凭据，聊天端点直接查 `is_active=True` 行，无需额外逻辑。

### 决策 2：API 端点放在 `/users/me/llm-config(s)`

**选择**：挂载在现有 `users` router

**端点规范**：
```
GET  /users/me/llm-config
     → 200 { provider, api_key_hint, base_url, model, custom_models }
           （返回 is_active=True 的 Provider 配置；api_key 仅返回后 4 位掩码）
     → 404 if 用户尚未激活任何 Provider

GET  /users/me/llm-configs
     → 200 [ { provider, api_key_hint, base_url, model, custom_models }, ... ]
           （返回该用户所有已保存 Provider 的完整列表，供 Modal 切换 Provider 时预填）

PUT  /users/me/llm-config
     Body: { provider, api_key?, base_url?, model }
           （api_key 可省略：省略时保留 DB 中已存值；首次为该 Provider 配置时必须提供）
     → 200 { provider, api_key_hint, base_url, model, custom_models }
     → 422 if 首次配置且缺少 api_key，或缺少 provider / model
```

**理由**：LLM 配置属于用户个人资料范畴，复用 `/users/me` 前缀与现有 profile 端点对齐；GET /llm-configs（复数）专用于 Modal 初始化加载全量 Provider 配置，与单数端点职责分离，避免前端多次请求。

### 决策 3：`stream_chat` 接受显式凭据参数，移除全局 settings 依赖

**选择**：`stream_chat(messages, system_prompt, credentials: dict)` 接收 `{"api_key", "base_url", "model"}` 字典；`_get_client()` 单例移除

**理由**：每位用户凭据不同，无法复用单一模块级 `AsyncOpenAI` 客户端；调用方（chat router）负责从 DB 读取用户配置并传入，service 层保持无状态。

**httpx 连接池**：`AsyncOpenAI` 实例按请求创建，httpx 底层会复用 TCP 连接（keep-alive），对低并发的个人平台性能影响可忽略。

### 决策 4：移除 `main.py` 启动时 API Key 校验钩子

**选择**：删除 `lifespan` 中的 `_get_client()` 调用

**理由**：全局凭据不再存在于 settings，服务端不持有任何 LLM API Key，无需启动校验。服务本身可以无 API Key 正常启动，凭据缺失只在用户未配置时体现为 400 响应。

### 决策 5：前端设置面板使用 Modal，嵌入 AI Chat 页 Header

**选择**：Header 右侧齿轮图标触发 Modal，Modal 内含配置表单

**UI 流程**：
1. 进入 AI Chat 页时调用 `GET /users/me/llm-config`
2. 若 404 → 显示未配置横幅 + 触发设置 Modal 按钮；Chat 输入区 disabled
3. 若 200 → 正常渲染，输入区可用
4. 配置成功保存后刷新状态，输入区恢复可用

**Model 预设列表**（按 Provider 分组）：
- DeepSeek: `deepseek-chat`、`deepseek-reasoner`
- DashScope: `qwen-plus`、`qwen-max`、`qwen3-235b-a22b`
- OpenAI: `gpt-4.1`、`gpt-4o`、`o4-mini`

用户可在预设列表之外输入任意 model name；模型名无效时 LLM 返回错误，前端在 Chat 界面内以醒目提示展示。

## 组件层级图

```
AIChatPage
├── ChatSessionSidebar           会话列表 + 新建按钮
├── [Header]
│   ├── 会话标题
│   └── 齿轮图标按钮              点击打开 Modal
│       └── LLMConfigModal       配置弹窗（含表单逻辑，内联不拆子组件）
│                                 · Provider 下拉
│                                 · API Key 输入（已保存时显示掩码提示）
│                                 · Base URL 输入（切换 Provider 自动预填）
│                                 · 模型选择（预设 / 已保存自定义 / 新增自定义）
├── [未配置横幅]                  仅在 llmConfig == null 时显示
├── MessageList
└── ChatInput                    llmConfig == null 时禁用
```

> **注**：表单字段与状态逻辑直接内联于 `LLMConfigModal`，未拆出独立 `LLMConfigPanel` 子组件。原因：表单状态（`savedConfigs`、`handleProviderChange`、`savedCustomModels`）高度耦合，强行拆分只会引入 prop-drilling 而无复用收益；当前无其他场景需要在 Modal 以外嵌入同一表单。

## Risks / Trade-offs

- **API Key 明文存储**：SQLite 文件访问即可获取 Key → 可接受，服务器访问控制是第一道防线；后续可加 AES 加密
- **per-request AsyncOpenAI 实例**：略微增加对象创建开销 → 低并发场景无感知
- **模型名错误反馈延迟**：用户输错 model name 后需发一条消息才能发现 → 已被 Out of Scope 排除预校验，通过错误提示引导用户回设置面板修正
- **Base URL 可选**：用户可不填，系统使用 Provider 默认值 → 需在保存时服务端做补全，确保存入 DB 的是完整 URL

## Migration Plan

1. 生成 Alembic 迁移：`alembic revision --autogenerate -m "add_user_llm_configs"`
2. 执行 `alembic upgrade head`
3. 修改 `backend/app/services/llm.py`：`stream_chat` 接受 credentials 参数，移除 `_get_client()` 单例
4. 修改 `backend/app/routers/chat.py`：流式端点读取用户 LLM 配置，未配置返回 400
5. 在 `backend/app/routers/users.py` 新增 GET / PUT `/users/me/llm-config`
6. 删除 `backend/app/main.py` lifespan 启动校验钩子
7. 创建 `src/components/chat/LLMConfigModal.tsx`
8. 修改 `src/pages/AIChatPage.tsx`：新增配置状态管理、设置按钮、未配置横幅
