import { useEffect, useRef } from 'react'

interface TrailPoint {
  x: number
  y: number
  timestamp: number
}

interface Props {
  theme: 'light' | 'dark'
}

const TRAIL_DURATION = 500
const MAX_POINTS = 30

export function MouseTrail({ theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailRef = useRef<TrailPoint[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e: MouseEvent) => {
      trailRef.current.push({ x: e.clientX, y: e.clientY, timestamp: Date.now() })
      if (trailRef.current.length > MAX_POINTS) trailRef.current.shift()
    }
    window.addEventListener('mousemove', onMouseMove)

    const color = theme === 'dark' ? '167, 139, 250' : '124, 58, 237'

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = Date.now()
      trailRef.current = trailRef.current.filter(p => now - p.timestamp < TRAIL_DURATION)

      trailRef.current.forEach(point => {
        const age = (now - point.timestamp) / TRAIL_DURATION
        const opacity = (1 - age) * 0.7
        const radius = (1 - age) * 4 + 0.5

        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius)
        gradient.addColorStop(0, `rgba(${color}, ${opacity})`)
        gradient.addColorStop(1, `rgba(${color}, 0)`)

        ctx.beginPath()
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [theme])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-40" />
}
