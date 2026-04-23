import { useCallback, useEffect, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { ISourceOptions } from '@tsparticles/engine'

const DARK_COLORS = ['#60a5fa', '#a78bfa', '#818cf8', '#c4b5fd', '#93c5fd']
const LIGHT_COLORS = ['#7c3aed', '#4f46e5', '#6d28d9', '#4338ca', '#5b21b6']

function buildConfig(isDark: boolean): ISourceOptions {
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS
  const bgColor = isDark ? '#030712' : '#ffffff'
  const isMobile = window.innerWidth < 768
  const particleCount = isMobile ? 40 : 60

  return {
    fullScreen: false,
    background: { color: { value: bgColor } },
    particles: {
      number: { value: particleCount, density: { enable: true } },
      color: { value: colors },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.6, max: 1 },
        animation: { enable: true, speed: 1, sync: false },
      },
      size: { value: { min: 1.5, max: 3 } },
      links: { enable: false },
      move: {
        enable: true,
        speed: { min: 3, max: 7 },
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'out' },
        trail: {
          enable: true,
          length: 20,
          fill: { color: { value: bgColor } },
        },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: ['repulse', 'trail'] },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4, speed: 1 },
        trail: {
          delay: 0.005,
          quantity: 4,
          particles: {
            color: { value: colors },
            size: { value: { min: 1, max: 2.5 } },
            links: { enable: false },
            move: {
              speed: { min: 2, max: 5 },
              outModes: { default: 'destroy' },
              trail: {
                enable: true,
                length: 15,
                fill: { color: { value: bgColor } },
              },
            },
            opacity: {
              value: { min: 0.2, max: 0.8 },
              animation: {
                enable: true,
                speed: 2,
                sync: false,
                startValue: 'max',
                destroy: 'min',
              },
            },
          },
        },
      },
    },
    detectRetina: true,
  }
}

interface Props {
  theme: 'light' | 'dark'
}

export function ParticlesBackground({ theme }: Props) {
  const [engineReady, setEngineReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async engine => {
      await loadSlim(engine)
    }).then(() => setEngineReady(true))
  }, [])

  const options = useMemo(() => buildConfig(theme === 'dark'), [theme])

  const particlesLoaded = useCallback(() => Promise.resolve(), [])

  if (!engineReady) return null

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 h-full w-full"
      options={options}
      particlesLoaded={particlesLoaded}
    />
  )
}
