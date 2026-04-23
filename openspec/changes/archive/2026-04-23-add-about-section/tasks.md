## Phase 1. 资源准备

- [x] 1.1 将个人头像图片放入 `public/avatar.jpg`（暂用渐变占位 SVG，命名 `avatar.svg`，待替换为真实照片）

## Phase 2. SocialLinks 组件

- [x] 2.1 创建 `src/components/SocialLinks.tsx`：定义社交链接数据数组（GitHub URL + 邮箱），渲染图标链接列表
- [x] 2.2 实现 GitHub 链接：带 GitHub SVG 图标，`target="_blank" rel="noopener noreferrer"`
- [x] 2.3 实现邮箱链接：带邮箱 SVG 图标，`href="mailto:<email>"`
- [x] 2.4 实现链接悬浮样式和 `focus-visible` 键盘访问样式，亮/暗模式适配

## Phase 3. AboutSection 组件

- [x] 3.1 创建 `src/components/AboutSection.tsx`：根元素为 `<section id="contact">`，响应式两栏布局（`flex flex-col md:flex-row`）
- [x] 3.2 实现左侧头像区域：`<img loading="lazy" />` 圆形裁剪，加载失败时显示渐变圆形占位
- [x] 3.3 实现右侧文字区域：姓名（`<h2>`）、个人简介（`<p>`）
- [x] 3.4 在右侧文字区域下方嵌入 `<SocialLinks />`
- [x] 3.5 实现亮/暗模式 section 背景与文字配色

## Phase 4. App.tsx 整合

- [x] 4.1 在 `App.tsx` 中引入 `AboutSection`，将 `<section id="contact" className="min-h-screen" />` 替换为 `<AboutSection />`
- [x] 4.2 验证 Navbar「联系我」链接点击后平滑滚动至关于我区域（锚点 `#contact` 不变，无需修改 Navbar）
