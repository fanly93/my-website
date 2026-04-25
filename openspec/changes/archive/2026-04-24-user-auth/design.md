## Context

当前项目是纯前端 SPA（React 19 + Vite），无任何后端服务。本次变更首次引入 FastAPI 后端，前后端完全独立部署：前端继续托管在 GitHub Pages，后端独立运行（本地开发或 VPS）。认证基于 JWT，前端通过 `Authorization: Bearer` 头访问受保护 API。

## Goals / Non-Goals

**Goals:**
- 建立独立 FastAPI 后端服务，ORM 层与数据库解耦（预留 MySQL / PostgreSQL 迁移路径）
- 实现 JWT access token + refresh token 双 token 认证
- 前端路由保护（未认证访问 `/dashboard` 重定向至 `/login`）
- 用户 profile CRUD（头像 URL、用户名、等级、连续学习天数）

**Non-Goals:**
- OAuth 社交登录、邮件验证、密码重置、RBAC、后台管理（见 proposal Out of Scope）

---

## 组件层级图

**后端结构**
```
backend/
├── app/
│   ├── main.py              # FastAPI app 实例，挂载路由，配置 CORS
│   ├── config.py            # 环境变量（DATABASE_URL, JWT_SECRET, TOKEN_EXPIRE）
│   ├── database.py          # SQLAlchemy async engine + SessionLocal
│   ├── dependencies.py      # get_db, get_current_user 依赖注入
│   ├── models/
│   │   └── user.py          # User ORM model（SQLAlchemy）
│   ├── schemas/
│   │   ├── auth.py          # TokenResponse, LoginRequest, RegisterRequest
│   │   └── user.py          # UserProfile, UserUpdate
│   ├── routers/
│   │   ├── auth.py          # POST /auth/register /login /refresh /logout
│   │   └── users.py         # GET/PATCH /users/me
│   └── services/
│       ├── auth.py          # JWT 生成 / 验证 / 刷新逻辑
│       └── user.py          # 用户查询 / 更新业务逻辑
├── alembic/
│   ├── env.py               # 读取 DATABASE_URL，支持异步迁移
│   └── versions/            # 迁移脚本
├── alembic.ini
├── requirements.txt
└── .env.example
```

**前端结构（变更部分）**
```
App.tsx
└── HashRouter
    └── AuthProvider          ← 新增，持有 useAuth（token + user 状态）
        └── Routes
            ├── /              → HomePage（不变）
            ├── /login         → LoginPage（新增）
            ├── /register      → RegisterPage（新增）
            └── /dashboard/*   → ProtectedRoute（新增）
                               └── DashboardPage（不变，内嵌 Layout）
                                   └── DashboardLayout
                                       ├── DashboardSidebar（修改：底部加用户信息 + 登出）
                                       └── <Outlet>
                                           ├── DashboardHome（不变）
                                           └── /profile → ProfilePage（新增）

新增文件：
src/
├── contexts/AuthContext.tsx   # AuthProvider + useAuth hook
├── hooks/useAuth.ts           # token 管理、登录/登出/刷新
├── pages/LoginPage.tsx
├── pages/RegisterPage.tsx
├── pages/ProfilePage.tsx
└── components/ProtectedRoute.tsx
```

---

## API 端点规范

**Base URL:** `http://localhost:8000`（开发环境，生产通过环境变量注入）

### POST /auth/register
```
Body:    { email: string, password: string, username: string }
201:     { id, email, username, created_at }
409:     { detail: "邮箱已注册" }
422:     字段校验失败
```

### POST /auth/login
```
Body:    { email: string, password: string }
200:     { access_token, refresh_token, token_type: "bearer" }
401:     { detail: "邮箱或密码错误" }
```

### POST /auth/refresh
```
Body:    { refresh_token: string }
200:     { access_token, refresh_token, token_type: "bearer" }
401:     { detail: "token 无效或已过期" }
```

### POST /auth/logout
```
Headers: Authorization: Bearer <access_token>
200:     { message: "已登出" }
```

### GET /users/me
```
Headers: Authorization: Bearer <access_token>
200:     UserProfile
401:     token 无效
```

### PATCH /users/me
```
Headers: Authorization: Bearer <access_token>
Body:    { username?: string, avatar_url?: string }
200:     UserProfile
```

**UserProfile schema:**
```json
{
  "id":          "string (uuid)",
  "email":       "string",
  "username":    "string",
  "avatar_url":  "string | null",
  "level":       "integer",
  "streak_days": "integer",
  "created_at":  "string (ISO 8601)"
}
```

---

## Decisions

### D1：JWT 存 localStorage（非 httpOnly Cookie）

**选择**：access token + refresh token 均存 localStorage

**理由**：前端部署在 GitHub Pages（与后端不同域），httpOnly Cookie 需要 `SameSite=None; Secure` 且后端必须同域或配置复杂 CORS，与当前架构不兼容。localStorage 方案简单直接，通过短期 access token（15 分钟）降低 XSS 风险。

**替代方案**：内存存储 access token + httpOnly Cookie 存 refresh token——安全性更高，但需要后端同域或反向代理，留作后续升级。

---

### D2：SQLAlchemy ORM 抽象数据库（预留多数据库切换）

**选择**：SQLAlchemy 2.0 async，通过 `DATABASE_URL` 环境变量切换驱动

| 数据库 | URL 格式 |
|--------|----------|
| SQLite（默认） | `sqlite+aiosqlite:///./app.db` |
| MySQL | `mysql+aiomysql://user:pass@host/db` |
| PostgreSQL | `postgresql+asyncpg://user:pass@host/db` |

业务代码只调用 SQLAlchemy Session，不依赖任何数据库方言，切换时只需修改 `.env` 中的 `DATABASE_URL` 并安装对应驱动。

---

### D3：token 有效期策略

| token | 有效期 | 用途 |
|-------|--------|------|
| access_token | 15 分钟 | API 请求鉴权 |
| refresh_token | 7 天 | 换取新 access_token |

前端 `useAuth` hook 拦截 API 401 响应，自动用 refresh_token 调用 `/auth/refresh` 换新 access_token，对业务代码透明。

---

### D4：密码哈希用 bcrypt（passlib）

**选择**：`passlib[bcrypt]`，cost factor 默认 12

业界标准，抗暴力破解，淘汰 MD5 / SHA1 / PBKDF2 等弱方案。

---

### D5：前端认证状态用 AuthContext + useAuth

**选择**：React Context 持有 `{ user, token, login, logout, refresh }` 状态

**理由**：认证状态需要在 ProtectedRoute、DashboardSidebar、ProfilePage 等多处共享，props drilling 无法满足跨层需求，Context 是最小化引入方式，不需要 Zustand / Redux。

---

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| JWT secret 硬编码泄露 | 通过 `.env` 注入，`.env` 加入 `.gitignore`，提供 `.env.example` |
| localStorage XSS 风险 | access token 15 分钟短期过期；Content-Security-Policy 后续加固 |
| SQLite 并发写入限制 | 开发阶段可接受；生产环境切换 PostgreSQL（仅改 DATABASE_URL）|
| CORS 配置错误导致前端无法请求 | `main.py` 明确列出 allowed origins，本地开发含 localhost:5173 |
| Alembic 迁移脚本缺少 downgrade | 每条迁移必须实现 `downgrade()` 函数，CI 中验证 |
| refresh token 被盗 | logout 时客户端清除 token；后续可引入 token 黑名单（Redis）|

## Open Questions

- Q1：`level`（用户等级）的计算规则是什么？当前按 mock 数值，后续是否自动根据学习天数/完成题数升级？
- Q2：`avatar_url` 是外链 URL 还是需要文件上传 API？当前方案仅支持 URL，文件上传留后续 change。
- Q3：后端生产部署平台？（影响 CORS allowed origins 配置）
