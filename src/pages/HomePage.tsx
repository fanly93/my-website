import { Navbar } from '../components/Navbar'
import { HeroSection } from '../components/HeroSection'
import { ProjectsSection } from '../components/ProjectsSection'
import { AboutSection } from '../components/AboutSection'

type Theme = 'light' | 'dark'

interface Props {
  theme: Theme
  toggleTheme: () => void
}

export function HomePage({ theme, toggleTheme }: Props) {
  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main>
        <HeroSection theme={theme} />
        <ProjectsSection />
        <AboutSection />
      </main>
    </>
  )
}
