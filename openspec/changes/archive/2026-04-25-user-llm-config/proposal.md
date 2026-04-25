## Why

平台目前所有用户共用服务端统一配置的 LLM API Key，无法支持多用户独立计费与 Provider 差异化需求。引入用户级 LLM 配置，让每位用户在 AI Chat 页内自行填写 API Key 和选择模型，配置安全存储于后端数据库。

## What Changes

**后端（新增）**
- 新增 `user_llm_configs` 表（user_id FK、provider、api_key、base_url、model），通过 Alembic 迁移
- 新增端点：`GET /users/me/llm-config`、`PUT /users/me/llm-config`
- 修改流式聊天端点：强制使用用户自定义配置；若用户尚未配置，返回 400 并提示用户先完成配置，不回退至服务端全局配置

**前端（新增）**
- AI Chat 页右上角新增「设置」图标按钮，点击展开配置面板（Modal 或侧拉抽屉）
- 配置面板包含：Provider 下拉选择（DeepSeek / DashScope / OpenAI）、API Key 输入框（掩码显示）、Base URL 输入框（可选，有对应 Provider 的默认值）、模型选择器（预设列表 + 自定义输入）
- 预设模型列表（按 Provider 分组）：
  - DeepSeek: `deepseek-chat`、`deepseek-reasoner`
  - DashScope: `qwen-plus`、`qwen-max`、`qwen3-235b-a22b`
  - OpenAI: `gpt-4.1`、`gpt-4o`、`o4-mini`
- 自定义模型名输入：用户可填写任意 model name；若 LLM 返回模型不存在错误，在 Chat 页以醒目提示展示
- 页面加载时自动拉取已保存配置并回填表单；保存成功显示 toast 提示

## Capabilities

### New Capabilities

- `user-llm-config`：用户级 LLM 配置管理——API Key / Base URL / 模型的存储、读取与更新，后端 CRUD 端点，前端配置面板 UI

### Modified Capabilities

- `llm-integration`：LLM 调用层改为接受调用方显式传入的凭据参数，不再依赖全局 settings；未传入凭据时直接报错，无兜底逻辑
- `ai-chat`：AI Chat 页新增设置入口与配置面板；用户未配置 API Key 时，输入框和发送按钮禁用并显示引导提示；模型名称无效时在对话界面显示清晰错误提示

## Impact

- **新增后端文件**：`backend/app/models/user_llm_config.py`、新 Alembic migration
- **修改后端文件**：`backend/app/routers/users.py`（新增 llm-config 端点）、`backend/app/services/llm.py`（接受动态凭据）、`backend/app/routers/chat.py`（传入用户配置）
- **新增前端文件**：`src/components/chat/LLMConfigPanel.tsx`
- **修改前端文件**：`src/pages/AIChatPage.tsx`（新增设置按钮 + 面板状态管理）
- **新增前端依赖**：无
- **不影响**：品牌站、Dashboard 其他功能、GitHub Pages 部署

## Out of Scope（不做）

- API Key 加密存储（明文存 DB，依赖 DB 访问控制保护）
- 多套配置切换（每个用户仅维护一套活跃配置）
- 用量统计 / 计费展示
- 服务端全局 API Key 兜底（每位用户必须自行配置，多租户完全隔离）
- API Key 有效性预校验（仅在实际发送消息时检测错误）

## 回滚方案

风险等级：**低**（新增独立配置表和 UI 面板，不修改核心对话逻辑的主路径）

1. 从 `chat.py` 移除用户配置读取逻辑，恢复使用 `settings` 全局配置（注意：回滚后退回单用户模式）
2. 注释 users router 中 llm-config 端点
3. 从 `AIChatPage.tsx` 移除设置按钮和面板
4. `alembic downgrade -1` 回退 `user_llm_configs` 表迁移
