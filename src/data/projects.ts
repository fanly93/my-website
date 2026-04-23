export interface Project {
  id: string
  name: string
  description: string
  imageUrl: string | undefined
  githubUrl: string
}

export const PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: 'OpenClaw 二次开发',
    description: '基于 OpenClaw 引擎进行二次开发，扩展游戏逻辑与关卡系统，探索开源游戏引擎的定制化能力。',
    imageUrl: '/my-website/projects/project-1.png',
    githubUrl: 'https://github.com/fanly93/secondary_development_openclaw',
  },
  {
    id: 'project-2',
    name: 'Document Review Agent',
    description: '基于大语言模型构建的智能文档审查 Agent，自动识别文档问题并生成审阅意见，提升文档处理效率。',
    imageUrl: '/my-website/projects/project-2.png',
    githubUrl: 'https://github.com/fanly93/document-review-agent',
  },
  {
    id: 'project-3',
    name: 'GraphRAG Agent',
    description: '融合知识图谱与 RAG 技术的智能问答 Agent，通过图结构增强检索精度，实现更准确的上下文理解。',
    imageUrl: '/my-website/projects/project-3.png',
    githubUrl: 'https://github.com/fanly93/GraphRagAgent',
  },
  {
    id: 'project-4',
    name: 'OlmOCR RAG',
    description: '结合 olmOCR 图像增强的多模态 RAG 系统，支持从图片和文档中提取信息并进行智能检索问答。',
    imageUrl: '/my-website/projects/project-4.png',
    githubUrl: 'https://github.com/fanly93/olmocr_rag',
  },
]
