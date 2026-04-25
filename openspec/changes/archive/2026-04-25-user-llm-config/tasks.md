## 1. 后端数据模型与迁移

- [x] 1.1 创建 `backend/app/models/user_llm_config.py`，定义 `UserLLMConfig` ORM 模型（id UUID、user_id FK、provider、api_key、base_url、model、is_active、custom_models、updated_at；`(user_id, provider)` 联合 UNIQUE 约束）
- [x] 1.2 在 `backend/alembic/env.py` 中 import `UserLLMConfig` 模型，确保 autogenerate 可检测到新表
- [x] 1.3 生成 Alembic 迁移脚本：`alembic revision --autogenerate -m "add_user_llm_configs"`，检查 upgrade / downgrade 函数
- [x] 1.4 执行 `alembic upgrade head`，验证 `user_llm_configs` 表已创建且 `(user_id, provider)` 有联合 UNIQUE 约束

## 2. 后端 Pydantic Schemas

- [x] 2.1 在 `backend/app/schemas/` 中新增（或扩展）LLM config 相关 schema：`LLMConfigRequest`（provider、api_key、base_url 可选、model）、`LLMConfigResponse`（provider、api_key_hint、base_url、model）
- [x] 2.2 验证：Python 导入 schema 模块无报错

## 3. 后端 LLM Service 重构

- [x] 3.1 修改 `backend/app/services/llm.py`：`stream_chat` 新增 `credentials: dict` 参数（含 api_key、base_url、model），移除模块级 `_client` 单例和 `_get_client()` 函数，改为在函数内按请求创建 `AsyncOpenAI` 实例
- [x] 3.2 验证：在 Python shell 中手动传入凭据调用 `stream_chat` 可正常流式返回

## 4. 后端 Users Router 新增 LLM Config 端点

- [x] 4.1 在 `backend/app/routers/users.py` 中新增 `GET /users/me/llm-config`：查询当前用户配置，无配置返回 404，有配置返回 `LLMConfigResponse`（api_key 仅返回后 4 位掩码）
- [x] 4.2 新增 `PUT /users/me/llm-config`：upsert 用户配置，base_url 为空时补全 Provider 默认值，返回 `LLMConfigResponse`
- [x] 4.3 验证：通过 `/docs` 测试 GET（无配置→404、有配置→200）和 PUT（首次创建、更新覆盖）

## 5. 后端 Chat Router 集成用户配置

- [x] 5.1 修改 `backend/app/routers/chat.py` 中的 `stream_message` 端点：在调用 LLM 前，从 DB 查询当前用户的 `UserLLMConfig`；若不存在，返回 HTTP 400（"请先配置 LLM API Key"），不调用 `stream_chat`
- [x] 5.2 将用户配置的 `api_key`、`base_url`、`model` 构建成 `credentials` dict，传入 `_sse_generator`，再传给 `stream_chat`
- [x] 5.3 更新 `_sse_generator` 签名，接受 `credentials: dict` 并透传给 `stream_chat`
- [x] 5.4 验证：有配置的用户可正常发消息；无配置的用户发消息收到 400

## 6. 移除启动校验钩子

- [x] 6.1 删除 `backend/app/main.py` 中的 `lifespan` 函数和 `_get_client()` 导入，将 `FastAPI(lifespan=lifespan)` 还原为 `FastAPI()`
- [x] 6.2 验证：后端服务正常启动，无报错

## 7. 前端 LLMConfigModal 组件

- [x] 7.1 创建 `src/components/chat/LLMConfigModal.tsx`：Modal 组件，包含 Provider 下拉（DeepSeek / DashScope / OpenAI）、API Key 输入框（密码类型，掩码显示）、Base URL 输入框（可选，随 Provider 切换自动填入默认值）、Model 选择（预设下拉 + 自定义输入选项）
- [x] 7.2 预设模型列表：DeepSeek（`deepseek-chat`、`deepseek-reasoner`）、DashScope（`qwen-plus`、`qwen-max`、`qwen3-235b-a22b`）、OpenAI（`gpt-4.1`、`gpt-4o`、`o4-mini`）；选择「自定义」时显示文本输入框
- [x] 7.3 实现表单提交：调用 `PUT /users/me/llm-config`，成功后调用 `onSave` 回调关闭 Modal 并显示 toast 提示「配置已保存」，失败时在 Modal 内显示错误信息
- [x] 7.4 实现预填逻辑：Modal 打开时接收当前 `llmConfig` prop，回填各字段；api_key 字段始终为空（不回填，用户需重新输入才覆盖）
- [x] 7.5 验证：亮色 / 暗色模式下 Modal 样式正常；Provider 切换时 Base URL 自动更新；自定义 Model 输入框正常显示

## 8. 前端 AIChatPage 集成

- [x] 8.1 修改 `src/pages/AIChatPage.tsx`：页面加载时调用 `GET /users/me/llm-config`，将结果存入 `llmConfig` state（null 表示未配置）
- [x] 8.2 Header 右侧新增齿轮图标按钮，点击设置 `showConfigModal = true`；渲染 `LLMConfigModal`，传入 `llmConfig` 和 `onSave` 回调（回调中更新 `llmConfig` state）
- [x] 8.3 `llmConfig === null` 时：在 MessageList 上方显示引导横幅（「请先配置 API Key 后开始对话」），`ChatInput` 的 `disabled` prop 传入 `true`
- [x] 8.4 `llmConfig !== null` 时：横幅消失，ChatInput 恢复可用（streaming 控制逻辑不变）
- [x] 8.5 验证：未配置时输入框禁用且横幅显示；保存配置后输入框解除禁用；模型名无效时发消息后 Chat 界面内可见 [ERROR] 提示

## 10. Per-Provider 持久化与自定义模型列表（演进功能）

- [x] 10.1 将 `user_llm_configs` 唯一约束从 `user_id` 改为 `(user_id, provider)`，新增 `is_active` 布尔列；生成并执行迁移 `per_provider_llm_config`
- [x] 10.2 新增 `custom_models TEXT` 列（JSON 数组，server_default='[]'）；生成并执行迁移 `add_custom_models`
- [x] 10.3 执行数据迁移 `backfill_custom_models`：将现有行的 `model` 字段（若为非预设模型）写入 `custom_models` 数组，防止历史数据丢失
- [x] 10.4 更新 `PUT /users/me/llm-config`：改为按 `(user_id, provider)` upsert；保存后将该 Provider 设为 `is_active=True`，其余设为 `False`；`api_key` 字段改为可选（省略时保留 DB 已存值，仅首次该 Provider 配置时必填）
- [x] 10.5 更新 `PUT /users/me/llm-config`：保存时将非预设 model 追加至 `custom_models`（含 backfill 上一个 model 的逻辑，防止版本升级前存量丢失）
- [x] 10.6 更新 `GET /users/me/llm-config`：改为查询 `is_active=True` 行；`_config_to_response` 中增加 read-time backfill（若 model 为自定义且不在 custom_models 中则自动补入）
- [x] 10.7 新增 `GET /users/me/llm-configs`（复数）端点：返回当前用户所有已保存 Provider 配置列表
- [x] 10.8 更新 `backend/app/routers/chat.py` 流式端点：查询条件改为 `is_active=True`
- [x] 10.9 更新 `LLMConfigModal`：`savedConfigs` 以 `current` prop 预填初始化（避免异步加载前 hint 闪烁）；`useEffect` 中调用 `GET /users/me/llm-configs` 合并加载全量配置
- [x] 10.10 更新 `LLMConfigModal`：切换 Provider 时从 `savedConfigs` 预填 base_url / model / savedCustomModels，无已存配置时回退到默认值
- [x] 10.11 更新 `LLMConfigModal` 模型选择 UI：改为三档 `<optgroup>`（预设模型 / 已保存自定义 / ＋新增自定义模型…）；选中「新增」时显示文本输入框

## 9. 端到端验证

- [x] 9.1 完整流程：新用户登录 → 进入 AI Chat → 看到禁用提示 → 打开设置配置 API Key 和模型 → 输入框解禁 → 发消息成功收到流式回复
- [x] 9.2 更新配置：修改 model 为自定义名 → 发消息 → 若模型名错误，Chat 界面显示错误提示
- [x] 9.3 配置持久化：刷新页面后配置仍在，输入框直接可用
- [x] 9.4 `npm run build` 无报错，`dist/` 正常生成
