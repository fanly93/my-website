# project-section Specification

## Purpose
TBD - created by archiving change add-project-section. Update Purpose after archive.
## Requirements
### Requirement: 项目展示区布局

系统 SHALL 渲染一个 `id="projects"` 的全宽 section，包含区域标题「我的项目」和响应式卡片网格。网格在移动端为单列，平板为两列，大屏（≥ 1280px）为四列。section 的根元素 SHALL 设置 `scroll-margin-top: 64px` 以防止 Navbar 遮挡。

#### Scenario: 桌面端四列展示

- **WHEN** 用户在宽度 ≥ 1280px 的桌面浏览器中打开页面
- **THEN** 项目卡片以四列网格排列展示

#### Scenario: 移动端单列展示

- **WHEN** 用户在移动端（宽度 < 640px）浏览器中打开页面
- **THEN** 项目卡片以单列垂直排列展示

#### Scenario: 锚点跳转不被 Navbar 遮挡（边界）

- **WHEN** 用户通过 Navbar「项目」链接或 Hero CTA 跳转至 `#projects`
- **THEN** section 顶部内容不被固定 Navbar 遮挡，`scroll-margin-top` 生效

---

### Requirement: 项目卡片内容

每张项目卡片 SHALL 展示以下内容：项目截图（`<img loading="lazy">`，若无真实截图则展示占位渐变背景）、项目名称（`<h3>`）、项目描述文字、指向 GitHub 仓库的外部链接（`target="_blank" rel="noopener noreferrer"`）。

#### Scenario: 完整卡片渲染

- **WHEN** 项目数据包含截图 URL、名称、描述和 GitHub 链接
- **THEN** 卡片完整展示四项内容，截图使用 lazy loading

#### Scenario: 截图缺失降级（边界）

- **WHEN** 项目数据中 `imageUrl` 为空或图片加载失败
- **THEN** 卡片截图区域展示渐变占位背景，其余内容正常显示

#### Scenario: GitHub 链接安全跳转

- **WHEN** 用户点击卡片上的 GitHub 链接
- **THEN** 在新标签页打开，且 `rel="noopener noreferrer"` 已设置

---

### Requirement: 卡片悬浮微特效

项目卡片在鼠标悬浮时 SHALL 呈现上浮位移（`translateY(-4px)`）和阴影增强效果，过渡时长 300ms，支持亮色/暗色模式下的不同阴影颜色。

#### Scenario: 悬浮动画触发

- **WHEN** 用户将鼠标悬浮在任意项目卡片上
- **THEN** 卡片在 300ms 内平滑上移 4px，阴影增强

#### Scenario: 离开悬浮恢复

- **WHEN** 用户将鼠标移出项目卡片
- **THEN** 卡片在 300ms 内平滑回到原始位置，阴影恢复

#### Scenario: 触摸设备无悬浮效果（边界）

- **WHEN** 用户在触摸屏设备上点击卡片
- **THEN** 无悬浮位移动画，卡片内容完整展示，GitHub 链接可正常点击

---

### Requirement: 暗色/亮色模式适配

项目展示区及所有卡片 SHALL 响应全局主题切换，亮色/暗色模式下使用对应的背景色、文字色和边框色，满足 WCAG AA 对比度标准。

#### Scenario: 暗色模式卡片样式

- **WHEN** 全局主题为暗色模式
- **THEN** 卡片背景为深色（如 `dark:bg-gray-900`），文字为浅色，边框为暗色

#### Scenario: 亮色模式卡片样式

- **WHEN** 全局主题为亮色模式
- **THEN** 卡片背景为白色（如 `bg-white`），文字为深色，边框为浅灰

