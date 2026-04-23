## MODIFIED Requirements

### Requirement: CTA 按钮锚点跳转

Hero Section SHALL 包含一个标记为「查看我的项目」的 CTA 按钮，点击后平滑滚动至页面内 `id="projects"` 的元素。该元素 SHALL 为真实的 `ProjectsSection` 组件（不再是空占位 section）。

#### Scenario: 点击 CTA 正常跳转

- **WHEN** 用户点击「查看我的项目」按钮
- **THEN** 页面平滑滚动至 `#projects` 锚点位置，展示项目展示区内容

#### Scenario: 键盘访问 CTA 按钮

- **WHEN** 用户通过 Tab 键聚焦到 CTA 按钮并按下 Enter
- **THEN** 触发与鼠标点击相同的锚点跳转行为

#### Scenario: 锚点目标不存在（边界）

- **WHEN** 页面中不存在 `id="projects"` 的元素
- **THEN** 点击 CTA 不触发报错，页面无可见跳转（浏览器默认行为）
