## 1. 后端项目初始化

- [x] 1.1 创建 `backend/` 目录结构：`app/models/`、`app/schemas/`、`app/routers/`、`app/services/`、`alembic/versions/`
- [x] 1.2 创建 `backend/requirements.txt`，包含 fastapi、uvicorn[standard]、sqlalchemy[asyncio]、aiosqlite、alembic、python-jose[cryptography]、passlib[bcrypt]、pydantic
- [x] 1.3 创建 `backend/.env.example`，列出 `DATABASE_URL`、`JWT_SECRET`、`JWT_ACCESS_EXPIRE_MINUTES`、`JWT_REFRESH_EXPIRE_DAYS` 变量
- [x] 1.4 创建 `backend/app/config.py`，用 pydantic-settings 读取环境变量，提供默认值
- [x] 1.5 创建 `backend/app/database.py`，配置 SQLAlchemy async engine + `AsyncSessionLocal` + `get_db` 依赖
- [x] 1.6 验证：在 `backend/` 目录执行 `pip install -r requirements.txt` 无报错

## 2. 数据模型与迁移

- [x] 2.1 创建 `backend/app/models/user.py`，定义 User ORM model（id UUID、email、username、hashed_password、avatar_url、level、streak_days、created_at）
- [x] 2.2 配置 `backend/alembic.ini` 和 `backend/alembic/env.py`（异步迁移，读取 `DATABASE_URL`）
- [x] 2.3 生成初始迁移脚本，验证 upgrade / downgrade 函数均存在
- [x] 2.4 验证：执行 `alembic upgrade head`，数据库中出现 users 表

## 3. Pydantic Schemas

- [x] 3.1 创建 `backend/app/schemas/auth.py`：`RegisterRequest`、`LoginRequest`、`TokenResponse`、`RefreshRequest`
- [x] 3.2 创建 `backend/app/schemas/user.py`：`UserProfile`、`UserUpdate`（username 可选、avatar_url 可选）
- [x] 3.3 验证：Python 导入上述 schema 模块无报错

## 4. 业务服务层

- [x] 4.1 创建 `backend/app/services/auth.py`：JWT 生成（access / refresh）与验证函数，过期时间读取自 config
- [x] 4.2 在 `backend/app/services/auth.py` 中实现密码哈希与校验（bcrypt）
- [x] 4.3 创建 `backend/app/services/user.py`：用户查询（按 email / id）、创建、更新函数
- [x] 4.4 验证：单元测试或手动调用验证 token 生成/验证逻辑正确，密码哈希不可逆

## 5. 依赖注入

- [x] 5.1 创建 `backend/app/dependencies.py`：实现 `get_current_user` 依赖，解析 `Authorization: Bearer` 头，token 无效或过期时抛出 401
- [x] 5.2 验证：使用无效 token 调用依赖时返回 401，有效 token 时正确返回 User 对象

## 6. Auth 路由

- [x] 6.1 创建 `backend/app/routers/auth.py`，实现 `POST /auth/register`（字段校验、重复邮箱 409、bcrypt 哈希、返回 201）
- [x] 6.2 实现 `POST /auth/login`（查找用户、验证密码、签发 access + refresh token、返回 200）
- [x] 6.3 实现 `POST /auth/refresh`（验证 refresh token、rotation、返回 200）
- [x] 6.4 实现 `POST /auth/logout`（需认证，返回 200）
- [x] 6.5 验证：通过 `/docs` 或 curl 测试 register → login → refresh → logout 流程无报错

## 7. User 路由

- [x] 7.1 创建 `backend/app/routers/users.py`，实现 `GET /users/me`（需认证，返回 UserProfile）
- [x] 7.2 实现 `PATCH /users/me`（需认证，仅允许更新 username / avatar_url，username 空字符串返回 422）
- [x] 7.3 验证：通过 `/docs` 测试 GET / PATCH /users/me 返回正确数据

## 8. FastAPI 应用入口

- [x] 8.1 创建 `backend/app/main.py`：创建 FastAPI 实例，挂载 auth / users 路由，配置 CORS（allowed origins 含 `http://localhost:5173` 和 GitHub Pages 地址）
- [x] 8.2 验证：`uvicorn app.main:app --reload` 启动成功，访问 `/docs` 确认所有端点列出

## 9. 前端 AuthContext 与 useAuth

- [x] 9.1 创建 `src/contexts/AuthContext.tsx`：定义 `AuthContext`（user、accessToken、login、logout）和 `AuthProvider`，初始化时从 localStorage 读取 token
- [x] 9.2 创建 `src/hooks/useAuth.ts`：封装 `useContext(AuthContext)`，暴露 `{ user, isAuthenticated, login, logout }`
- [x] 9.3 封装 `src/utils/apiFetch.ts`：收到 401 时自动调用 `/auth/refresh` 并重试原请求，refresh 失败时调用 `logout()`
- [x] 9.4 验证：`npm run build` 无 TypeScript 报错

## 10. ProtectedRoute 组件

- [x] 10.1 创建 `src/components/ProtectedRoute.tsx`：读取 `isAuthenticated`，未认证时跳转至 `/#/login?redirect=<当前路径>`，认证时渲染 `<Outlet />`
- [x] 10.2 验证：未登录状态直接访问 `/#/dashboard` 跳转至 `/#/login`

## 11. 登录页

- [x] 11.1 创建 `src/pages/LoginPage.tsx`：邮箱 + 密码表单，调用 `useAuth().login()`，成功后跳转至 `redirect` 参数路径或 `/#/dashboard`
- [x] 11.2 在 LoginPage 中处理错误状态：4xx 响应时显示错误信息，清空密码输入框，不跳转
- [x] 11.3 已认证用户访问 `/#/login` 时重定向至 `/#/dashboard`
- [x] 11.4 验证：登录成功跳转正确，凭证错误时错误信息显示且停留在登录页

## 12. 注册页

- [x] 12.1 创建 `src/pages/RegisterPage.tsx`：邮箱 + 密码 + 用户名表单，调用 `POST /auth/register`
- [x] 12.2 注册成功（201）后跳转至 `/#/login`；4xx 错误在表单内显示，不跳转
- [x] 12.3 已认证用户访问 `/#/register` 时重定向至 `/#/dashboard`
- [x] 12.4 验证：注册后跳转 `/#/login`，邮箱重复时显示 409 错误信息

## 13. 用户资料页

- [x] 13.1 创建 `src/pages/ProfilePage.tsx`：挂载时调用 `GET /users/me`，展示 avatar、username、level、streak_days
- [x] 13.2 实现 profile 编辑：username 和 avatar_url 可编辑，点击保存调用 `PATCH /users/me`，成功后刷新显示
- [x] 13.3 API 加载失败时显示错误提示，不渲染空白内容
- [x] 13.4 验证：修改用户名后刷新页面仍显示新值

## 14. 路由更新

- [x] 14.1 在 `src/App.tsx` 中用 `AuthProvider` 包裹路由树，新增 `/login`、`/register` 路由
- [x] 14.2 将 `/dashboard/*` 路由替换为 `ProtectedRoute` 包裹
- [x] 14.3 在 `/dashboard/*` 子路由下新增 `/profile` 路由，渲染 `ProfilePage`
- [x] 14.4 验证：`npm run build` 无报错，所有路由可正常导航

## 15. DashboardSidebar 更新

- [x] 15.1 在 `DashboardSidebar.tsx` 底部新增用户信息区域：显示 username 和 avatar（从 AuthContext 读取）
- [x] 15.2 新增「退出登录」按钮，点击调用 `logout()`，跳转至 `/#/login`
- [x] 15.3 验证：登录后 sidebar 显示用户名，点击退出后跳转登录页且 localStorage token 已清除

## 16. 端到端验证

- [x] 16.1 完整流程：注册 → 登录 → 访问 dashboard → 查看 profile → 修改用户名 → 登出 → 再次访问 dashboard 被重定向
- [x] 16.2 token 刷新场景：access token 过期后操作透明，refresh 失败后跳转登录页
- [x] 16.3 前端构建验证：`npm run build` 无报错，`dist/` 正常生成
