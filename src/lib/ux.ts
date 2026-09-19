import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import gsap from 'gsap'
import { useHoverDevice } from './browser'

/**
 * Cursor-reactive tilt for glass cards. Transform-only, deactivated on any
 * device that does not support hover (touch / pen primary input).
 */
export function useTilt<T extends HTMLElement>(max = 5.5) {
  const hover = useHoverDevice()
  const innerRef = useRef<T>(null)

  const onMove = useCallback(
    (e: ReactPointerEvent<T>) => {
      if (!hover) return
      const el = innerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      gsap.to(el, {
        rotationX: -py * max,
        rotationY: px * max,
        transformPerspective: 750,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    },
    [hover, max],
  )

  const onLeave = useCallback(() => {
    gsap.to(innerRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.9,
      ease: 'elastic.out(1, 0.55)',
      overwrite: 'auto',
    })
  }, [])

  return { innerRef, onMove, onLeave }
}

/**
 * Magnetic CTA — the button glides a few pixels toward the cursor when it is
 * inside the magnet radius and springs back on exit. Hover devices only.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.28) {
  const hover = useHoverDevice()
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!hover) return
    const el = ref.current
    if (!el) return

    // only pull toward the cursor while the button is actually on screen
    let inView = false
    const io = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), {
      rootMargin: '120px',
    })
    io.observe(el)

    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'elastic.out(1, 0.45)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'elastic.out(1, 0.45)' })

    const onMove = (e: PointerEvent) => {
      if (!inView) {
        xTo(0)
        yTo(0)
        return
      }
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const radius = Math.max(r.width * 1.8, 160)
      const d = Math.hypot(dx, dy)
      if (d < radius) {
        const pull = (1 - d / radius) * strength
        xTo(dx * pull * 2.2)
        yTo(dy * pull * 2.2)
      } else {
        xTo(0)
        yTo(0)
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      io.disconnect()
    }
  }, [hover, strength])

  return ref
}