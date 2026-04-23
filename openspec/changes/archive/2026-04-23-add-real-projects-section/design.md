## Context

纯内容替换变更，不涉及组件架构调整。图片资源直接放入 `public/` 目录，随 git 仓库管理；项目数据硬编码在 `src/data/projects.ts`；邮箱地址硬编码在 `src/components/SocialLinks.tsx`。

## Goals / Non-Goals

**Goals:**
- 所有占位内容替换为真实内容
- 邮箱地址更新为 `fanly93@qq.com`

**Non-Goals:**
- 组件结构调整
- 新增功能

## Decisions

### 图片资源管理：git 仓库直接存储

**选择**：图片文件直接 commit 进仓库

**理由**：个人品牌站图片数量少（1 张头像 + 4 张截图），总体积可控，无需引入外部 CDN。

### 邮箱数据位置：硬编码在 SocialLinks.tsx

保持现有设计，直接修改 `href="mailto:fanly93@qq.com"`，无需抽成配置文件。

## Risks / Trade-offs

- 图片文件进入 git history，建议压缩后上传（建议 < 300KB/张）
- 项目描述为静态文本，更新时需修改代码后重新部署

## Migration Plan

已完成部分直接生效（头像、截图、项目数据）；邮箱更新为最后一步，修改后推送即触发自动部署。
