import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { deviceBus, pointerBus } from './bus'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

/**
 * Boot smooth scrolling + the GSAP/ScrollTrigger bridge.
 * Lenis is skipped entirely when the user prefers reduced motion —
 * native scrolling keeps the page fully usable without cinematic flair.
 */
export function initSmoothScroll(): Lenis | null {
  if (deviceBus.reduced) return null
  if (lenis) return lenis

  lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
    wheelMultiplier: 1,
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function getLenis(): Lenis | null {
  return lenis
}

/** Smoothly travel to a selector / element / offset. */
export function scrollToTarget(target: string | number, offset = 0): void {
  if (lenis) {
    lenis.scrollTo(target as never, { offset, duration: 1.4 })
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : null
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/** Avoid measuring while fonts/lazy chunks are still settling. */
export function refreshScrollTriggers(): void {
  gsap.delayedCall(0.06, () => ScrollTrigger.refresh())
}

/** Track normalized pointer for the (hover-only) parallax + tilt layer. */
export function initPointerTracking(): void {
  if (!deviceBus.hover || typeof window === 'undefined') return
  const onMove = (e: PointerEvent) => {
    pointerBus.x = (e.clientX / window.innerWidth) * 2 - 1
    pointerBus.y = (e.clientY / window.innerHeight) * 2 - 1
    pointerBus.active = true
  }
  window.addEventListener('pointermove', onMove, { passive: true })
}