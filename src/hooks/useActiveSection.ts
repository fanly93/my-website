import { useState, useEffect } from 'react'

function getInitialActiveId(ids: string[]): string {
  const center = window.innerHeight / 2
  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const { top, bottom } = el.getBoundingClientRect()
    if (top <= center && bottom >= center) return id
  }
  // Fall back to whichever section's top is closest to viewport center from above
  let best = ids[0] ?? ''
  let bestDist = Infinity
  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const dist = Math.abs(el.getBoundingClientRect().top - center)
    if (dist < bestDist) { bestDist = dist; best = id }
  }
  return best
}

export function useActiveSection(ids: string[]): string {
  const [activeId, setActiveId] = useState(() => getInitialActiveId(ids))

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id)
        },
        { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [ids])

  return activeId
}
