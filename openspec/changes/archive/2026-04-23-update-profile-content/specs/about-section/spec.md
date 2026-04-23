## MODIFIED Requirements

### Requirement: 个人简介文字

右侧 SHALL 展示开发者的个人简介，包含：姓名或称呼（`<h2>`）、一段个人介绍文字（`<p>`）。简介 SHALL 体现大模型开发工程师的专业背景，涵盖 LLM 应用开发、AI Agent 系统设计、RAG 检索增强生成、知识图谱构建、多模态文档理解等技术方向及工程理念。文字颜色 SHALL 在亮色/暗色模式下均满足 WCAG AA 对比度标准。

#### Scenario: 简介内容完整展示

- **WHEN** 用户访问关于我区域
- **THEN** 姓名和个人介绍文字均清晰可读，亮暗模式下对比度均达标

#### Scenario: 暗色模式文字颜色（边界）

- **WHEN** 全局主题为暗色模式
- **THEN** 简介文字为浅色（如 `dark:text-white` / `dark:text-gray-300`），背景为深色，对比度达标
