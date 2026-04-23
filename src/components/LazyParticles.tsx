import { lazy, Suspense } from 'react'

const ParticlesBackground = lazy(() =>
  import('./ParticlesBackground').then(m => ({ default: m.ParticlesBackground }))
)

interface Props {
  theme: 'light' | 'dark'
}

export function LazyParticles({ theme }: Props) {
  return (
    <Suspense fallback={null}>
      <ParticlesBackground theme={theme} />
    </Suspense>
  )
}
