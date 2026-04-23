## MODIFIED Requirements

### Requirement: 项目卡片内容

每张项目卡片 SHALL 展示以下内容：项目截图（`<img loading="lazy">`，若无真实截图则展示占位渐变背景）、项目名称（`<h3>`）、项目描述文字、指向 GitHub 仓库的外部链接（`target="_blank" rel="noopener noreferrer"`）。项目数据 SHALL 为真实项目内容，不使用占位文本。

展示的四个真实项目为：
- OpenClaw 二次开发（`secondary_development_openclaw`）
- Document Review Agent
- GraphRAG Agent
- OlmOCR RAG

#### Scenario: 完整卡片渲染

- **WHEN** 项目数据包含截图 URL、名称、描述和 GitHub 链接
- **THEN** 卡片完整展示四项内容，截图使用 lazy loading

#### Scenario: 截图缺失降级（边界）

- **WHEN** 项目数据中 `imageUrl` 为空或图片加载失败
- **THEN** 卡片截图区域展示渐变占位背景，其余内容正常显示

#### Scenario: GitHub 链接安全跳转

- **WHEN** 用户点击卡片上的 GitHub 链接
- **THEN** 在新标签页打开对应的真实 GitHub 仓库页面，且 `rel="noopener noreferrer"` 已设置
