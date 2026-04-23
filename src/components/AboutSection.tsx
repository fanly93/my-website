import { SocialLinks } from './SocialLinks'

export function AboutSection() {
  return (
    <section
      id="contact"
      className="w-full py-20 px-6 bg-white dark:bg-gray-900"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* 左侧头像 */}
        <div className="shrink-0">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-600">
            <img
              src="/my-website/avatar.jpg"
              alt="小林fanly 的个人头像"
              loading="lazy"
              className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        </div>

        {/* 右侧文字 */}
        <div className="flex flex-col gap-4 text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            关于我
          </h2>
          <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300 max-w-lg">
            你好，我是小林fanly，一名大模型开发工程师。专注于 LLM 应用开发与 AI Agent 系统设计，在 RAG 检索增强生成、知识图谱构建、多模态文档理解等方向积累了丰富的工程实践经验。热衷于将前沿 AI 技术转化为真实可落地的智能产品，相信好的 AI 工程不只是调用 API，而是深刻理解业务、精心设计系统、持续打磨体验。
          </p>
          <SocialLinks />
        </div>
      </div>
    </section>
  )
}
