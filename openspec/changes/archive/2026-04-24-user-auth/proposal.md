## Why

Dashboard 目前无任何访问控制，任何人直接访问 `/#/dashboard` 即可进入。引入用户认证以保护 dashboard，同时建立用户身份体系，为后续学习记录、AI 问答历史等个性化功能打基础。

## What Changes

**后端（新建）**
- 新建 `backend/` FastAPI 项目，独立于前端构建
- SQLite + SQLAlchemy ORM + Alembic 数据库迁移，ORM 层与具体数据库解耦，预留 MySQL / PostgreSQL 替换
- 用户注册 API（邮箱 + 密码，bcrypt 哈希）
- 用户登录 API（凭证验证 + JWT 签发）
- JWT access token（短期）+ refresh token（长期）机制
- 用户 profile API（查询 / 更新头像、用户名、等级、连续学习天数等）
- **[变更 2026-04-24]** 头像文件上传 API（`POST /users/me/avatar`），支持 JPEG/PNG/GIF/WebP，文件存 `backend/uploads/`，通过 `/uploads/<filename>` 静态访问

**前端（新增页面 + 路由保护）**
- 新增 `/login`、`/register` 页面
- 新增 `/profile` 页面（展示 + 编辑用户资料）
- **[变更 2026-04-24]** profile 页提供「返回 Dashboard」导航入口
- **[变更 2026-04-24]** profile 页头像区域支持点击上传本地图片，上传后实时预览
- `/#/dashboard` 及子路由设为受保护路由，未认证时重定向至 `/login`
- JWT token 存 localStorage，请求时携带 `Authorization: Bearer <token>`
- **[变更 2026-04-24]** AuthContext 使用 `apiFetch` 获取用户信息，token 过期时自动刷新，防止侧边栏用户区域因 401 意外消失
- **[变更 2026-04-24]** profile 更新成功后调用 `refreshUser()` 同步更新 AuthContext，侧边栏即时展示最新用户名和头像

## Capabilities

### New Capabilities

- `user-registration`：用户注册流程（邮箱 + 密码、字段验证、重复注册检测）
- `user-login`：登录流程（凭证验证、JWT 签发、token 客户端存储）
- `jwt-auth`：JWT 生命周期管理（access token / refresh token / 过期自动刷新 / 登出吊销）
- `user-profile`：用户资料查询与编辑（头像本地上传、用户名修改、用户等级、连续学习天数、注册时间）

### Modified Capabilities

- `routing`：新增受保护路由行为——未认证用户访问 `/dashboard` 及子路由时，SHALL 重定向至 `/login`；登录成功后跳回原目标路径

## Impact

- **新增目录**：`backend/`（FastAPI 项目，含 `app/`、`alembic/`、`uploads/`、`requirements.txt`）
- **新增前端页面**：`src/pages/LoginPage.tsx`、`src/pages/RegisterPage.tsx`、`src/pages/ProfilePage.tsx`
- **新增前端工具**：`src/contexts/AuthContext.tsx`（含 `refreshUser`）、`src/hooks/useAuth.ts`、`src/utils/apiFetch.ts`
- **修改**：`src/App.tsx`（新增路由）、`src/components/dashboard/DashboardSidebar.tsx`（底部用户信息 + 登出入口）
- **后端依赖**：`fastapi`、`uvicorn`、`sqlalchemy`、`alembic`、`python-jose[cryptography]`、`bcrypt`、`pydantic[email]`
- **前端依赖**：无新增（使用原生 `fetch` / `apiFetch`）
- **不影响**：前端构建流程（`npm run build`）、GitHub Pages 部署

## Out of Scope（不做）

- 后台管理（用户列表、封禁等）
- 社交登录（GitHub / Google OAuth）
- 邮件验证 / 密码重置流程
- 多用户权限体系（RBAC / 角色管理）
- 短信验证码 / 二步验证（2FA）
- 会话管理 UI（查看登录设备列表）
- 头像文件存储服务（CDN / 对象存储），当前仅支持本地磁盘存储

## 回滚方案

风险等级：**中**（涉及前端路由保护 + 新增后端服务）

回滚步骤：
1. **前端**：移除 `App.tsx` 中的路由守卫逻辑，`/#/dashboard` 恢复公开访问；删除 Login / Register / Profile 页面
2. **后端**：停止后端服务进程，不影响前端运行
3. **数据库**：`alembic downgrade base` 回退所有迁移，删除 `backend/` 目录
4. 前端 `npm run build` 验证构建正常

---

## 变更记录

| 日期 | 变更内容 | 原因 |
|------|---------|------|
| 2026-04-24 | 新增 `POST /users/me/avatar` 头像文件上传 API；后端 `/uploads/` 静态文件服务 | 原方案仅支持 URL 输入，用户无法上传本地图片 |
| 2026-04-24 | ProfilePage 新增「返回 Dashboard」导航链接 | 保存后无法返回 Dashboard，交互断层 |
| 2026-04-24 | AuthContext 改用 `apiFetch` 拉取 `/users/me`，防止 token 过期后侧边栏用户区消失 | token 15 分钟过期后原生 fetch 返回 401，user 被置为 null，导致侧边栏头像和用户名消失 |
| 2026-04-24 | AuthContext 新增 `refreshUser()`；ProfilePage 保存/上传后调用以同步侧边栏状态 | 头像和用户名更新后侧边栏不同步，仍显示旧数据 |
| 2026-04-24 | 修复所有表单输入框亮色/暗色模式下文字不可见问题 | 原输入框使用纯暗色样式（`text-white bg-white/5`），在亮色模式下白字白底不可见 |
| 2026-04-24 | DashboardSidebar 头像 URL 拼接后端域名 | `/uploads/` 相对路径直接作为 `src`，浏览器从前端域名请求导致 404 |
