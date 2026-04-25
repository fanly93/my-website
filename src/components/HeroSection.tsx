import { Link } from 'react-router-dom'
import { LazyParticles } from './LazyParticles'

type Theme = 'light' | 'dark'

interface Props {
  theme: Theme
}

function getReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function HeroSection({ theme }: Props) {
  const reducedMotion = getReducedMotion()

  return (
    <section id="home" className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-white dark:bg-gray-950">
      {!reducedMotion && <LazyParticles key={theme} theme={theme} />}

      <div className="relative z-10 flex flex-col items-center gap-6 rounded-2xl bg-white/20 px-8 py-8 text-center backdrop-blur-sm dark:bg-black/30">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
          小林fanly
        </h1>

        <p className="text-lg font-medium text-violet-600 dark:text-violet-400 sm:text-xl">
          大模型开发工程师
        </p>

        <p className="max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
          专注于大语言模型应用开发与 AI Agent 系统构建，深耕 RAG 检索增强、知识图谱融合与多模态理解等前沿方向。致力于将 LLM 的能力落地为真实可用的智能产品，让 AI 真正解决业务问题。
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <a
            href="#projects"
            className="rounded-full bg-violet-600 px-8 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:bg-violet-500 dark:focus-visible:ring-offset-gray-950 sm:text-base"
          >
            查看我的项目
          </a>
          <Link
            to="/dashboard"
            className="rounded-full border border-violet-600 px-8 py-3 text-sm font-semibold text-violet-600 hover:bg-violet-600 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-violet-400 dark:text-violet-400 dark:hover:bg-violet-500 dark:hover:text-white dark:focus-visible:ring-offset-gray-950 sm:text-base"
          >
            进入学习助手
          </Link>
        </div>
      </div>
    </section>
  )
}
