## Why

个人品牌站目前只有 Hero Section 和项目展示区，访客无法了解开发者的个人背景、技术方向和联系方式。「关于我」区域是建立个人信任感的关键模块，补全站点的信息架构。

## What Changes

- **新增** `AboutSection` 组件：左右两栏布局，左侧个人形象照，右侧个人简介文字
- **新增** `SocialLinks` 组件：展示 GitHub 和邮箱入口（纯展示，无表单）
- **修改** `App.tsx`：用 `<AboutSection />` 替换 `<section id="contact" className="min-h-screen" />`

## Capabilities

### New Capabilities

- `about-section`: 关于我区域，包含个人照片、个人简介、社交账号链接展示

### Modified Capabilities

无。现有模块行为不变。

## Impact

- **组件**：新增 `src/components/AboutSection.tsx`、`src/components/SocialLinks.tsx`
- **资源**：新增个人形象照（`public/avatar.jpg` 或类似路径），使用 lazy loading
- **App.tsx**：替换 contact 占位 section
- **无新依赖**：使用现有 Tailwind CSS，无需引入新库

## Out of Scope

- 联系我表单（用户无法提交任何信息）
- 评论功能
- 即时通讯或聊天入口
