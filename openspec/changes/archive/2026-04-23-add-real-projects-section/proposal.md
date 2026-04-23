## Why

站点上线后展示的是占位内容（渐变色头像、示例项目名称、示例描述、错误邮箱），需要替换为真实的个人信息，使站点真正可用于个人品牌展示。

## What Changes

- **修改** `public/avatar.jpg`：替换为真实个人头像（已完成）
- **修改** `public/projects/project-{1-4}.png`：替换为真实项目截图（已完成）
- **修改** `src/data/projects.ts`：填入真实项目名称、描述、GitHub 链接（已完成）
- **修改** `src/components/AboutSection.tsx`：头像路径从 `.svg` 改为 `.jpg`（已完成）
- **修改** `src/components/SocialLinks.tsx`：邮箱从 `fanly93@gmail.com` 更新为 `fanly93@qq.com`

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `about-section`：邮箱联系方式更新为正确地址
- `project-section`：项目数据替换为真实内容（图片、名称、描述、链接）

## Impact

- **仅修改静态数据和资源文件**，无组件逻辑变更
- **无新依赖**

## Out of Scope

- 用户信息提交表单
