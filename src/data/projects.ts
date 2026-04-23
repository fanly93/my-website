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
    name: '个人品牌站',
    description: '基于 React 19 + Vite + Tailwind CSS v4 构建的个人主页，支持暗色模式、粒子特效与流畅动画。',
    imageUrl: '/my-website/projects/project-1.svg',
    githubUrl: 'https://github.com/fanly93/my-website',
  },
  {
    id: 'project-2',
    name: '项目二',
    description: '待填写项目描述。这里展示项目的核心功能和技术亮点，帮助访客快速了解项目价值。',
    imageUrl: '/my-website/projects/project-2.svg',
    githubUrl: 'https://github.com/fanly93',
  },
  {
    id: 'project-3',
    name: '项目三',
    description: '待填写项目描述。这里展示项目的核心功能和技术亮点，帮助访客快速了解项目价值。',
    imageUrl: '/my-website/projects/project-3.svg',
    githubUrl: 'https://github.com/fanly93',
  },
  {
    id: 'project-4',
    name: '项目四',
    description: '待填写项目描述。这里展示项目的核心功能和技术亮点，帮助访客快速了解项目价值。',
    imageUrl: '/my-website/projects/project-4.svg',
    githubUrl: 'https://github.com/fanly93',
  },
]
