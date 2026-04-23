import { PROJECTS } from '../data/projects'
import { ProjectCard } from './ProjectCard'

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="w-full py-20 px-6 bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          我的项目
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {PROJECTS.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
