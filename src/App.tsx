import { useTheme } from './hooks/useTheme'
import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { ProjectsSection } from './components/ProjectsSection'
import { AboutSection } from './components/AboutSection'
import { MouseTrail } from './components/MouseTrail'

// Static check at module load — sufficient since users rarely toggle this without a page refresh
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      {!reducedMotion && <MouseTrail theme={theme} />}
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main>
        <HeroSection theme={theme} />
        <ProjectsSection />
        <AboutSection />
      </main>
    </>
  )
}

export default App
