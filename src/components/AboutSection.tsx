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
              src="/my-website/avatar.svg"
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
            你好，我是小林fanly，一名热爱构建优雅数字体验的软件工程师。专注于 Web 全栈开发，对性能优化、交互设计和开发者体验有浓厚兴趣。相信代码不只是工具，更是表达创意的艺术。
          </p>
          <SocialLinks />
        </div>
      </div>
    </section>
  )
}
