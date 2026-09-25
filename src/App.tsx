import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneEvents, scrollBus } from './lib/bus'
import { initDevice, usePrefersReducedMotion } from './lib/browser'
import { initPointerTracking, initSmoothScroll, refreshScrollTriggers } from './lib/smooth'
import { AskPillars } from './components/ui/AskPillars'
import { Contact } from './components/ui/Contact'
import { Hero } from './components/ui/Hero'
import { Loader } from './components/ui/Loader'
import { Nav } from './components/ui/Nav'
import { ServicesSection } from './components/ui/Services'
import { StaticFallback } from './components/ui/StaticFallback'
import { Testimonials } from './components/ui/Testimonials'

gsap.registerPlugin(ScrollTrigger)

// WebGL layer stays in its own lazy chunk (DRACO/three are heavy).
const SceneCanvas = lazy(() => import('./components/three/SceneCanvas'))

/* Reveal vectors — sections arrive on alternating axis, not all from below. */
const REVEAL_VARIANTS = {
  up: { x: 0, y: 52, scale: 1, rotationX: 0 },
  left: { x: -64, y: 0, scale: 1, rotationX: 0 },
  right: { x: 64, y: 0, scale: 1, rotationX: 0 },
  pop: { x: 0, y: 30, scale: 0.95, rotationX: -3 },
} as const

type RevealName = keyof typeof REVEAL_VARIANTS

/** fraction of total scroll distance where an element sits — for camera beats */
function elementFraction(sel: string, dy = 0): number {
  const el = document.querySelector<HTMLElement>(sel)
  if (!el) return 1
  const span = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const top = el.getBoundingClientRect().top + window.scrollY + dy
  return Math.min(1, Math.max(0, top / span))
}

/**
 * Measure where the seven camera keyframes should land in the REAL layout
 * (hero centre, hero base, services, detail panel, studio, contact, deepest).
 * Rewritten on every ScrollTrigger refresh so the choreography never drifts.
 */
function measureBeats(): number[] {
  const vh = window.innerHeight
  const span = Math.max(1, document.documentElement.scrollHeight - vh)
  return [
    (window.scrollY + vh * 0.4) / span,
    (window.scrollY + vh * 0.98) / span,
    elementFraction('#services'),
    Math.min(1, elementFraction('[data-service-target]', -40)),
    elementFraction('#studio'),
    elementFraction('#contact'),
    1,
  ]
}

export default function App() {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  // WebGL capability is probed AFTER first paint: running `initDevice()` inside
  // the render (state initializer) creates a GPU context on the critical path,
  // which blocks the boot curtain on weak machines. Optimistic `true` here;
  // the post-paint effect swaps to `false` (=> static fallback) if unsupported.
  const [webglOk, setWebglOk] = useState(true)
  const [sceneFailed, setSceneFailed] = useState(false)
  const [mountScene, setMountScene] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [curtainFade, setCurtainFade] = useState(false)
  const [curtainGone, setCurtainGone] = useState(false)

  // Boot-time device flags after the first paint (cheap matchMedia + one WebGL
  // context check). Also feeds `deviceBus`, which the scene reads on mount.
  useEffect(() => {
    let mounted = true
    const id = window.setTimeout(() => {
      const info = initDevice()
      if (mounted && !info.webgl) setWebglOk(false)
    }, 0)
    return () => {
      mounted = false
      window.clearTimeout(id)
    }
  }, [])

  // Reduced motion renders the lean static fallback instead of the WebGL layer.
  // `?static=1` forces the fallback for QA/perf comparisons (and lets the client
  // preview the graceful-degradation path).
  const [forceStatic] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('static') === '1'
    } catch {
      return false
    }
  })
  const showStatic = forceStatic || !webglOk || sceneFailed

  // mirror the reduced-motion preference onto <html> so CSS can settle states
  useEffect(() => {
    document.documentElement.classList.toggle('reduce', reduced)
  }, [reduced])

  // Short, fixed curtain beat — copy/cards never wait on the 3D layer to load.
  useEffect(() => {
    const fade = window.setTimeout(() => setCurtainFade(true), 700)
    const gone = window.setTimeout(() => setCurtainGone(true), 1400)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(gone)
    }
  }, [])

  // Evaluate the three.js chunk only once the main thread is quiet (idle
  // callback with a hard cap). Content paint + interactivity happen first,
  // then the scene slides in beneath — the right order on slow phones.
  useEffect(() => {
    if (showStatic) return
    const start = () => setMountScene(true)
    // evaluate the heavy chunk when the main thread is quiet, with a hard cap
    const id = window.requestIdleCallback(start, { timeout: 800 })
    return () => window.cancelIdleCallback(id)
  }, [showStatic])

  useEffect(() => {
    initSmoothScroll()
    initPointerTracking()
    // calibrate the camera story against the real DOM layout
    const syncBeats = () => {
      scrollBus.beats = measureBeats()
    }
    scrollBus.beats = measureBeats()
    ScrollTrigger.addEventListener('refresh', syncBeats)
    const onLoad = () => refreshScrollTriggers()
    window.addEventListener('load', onLoad)
    return () => {
      window.removeEventListener('load', onLoad)
      ScrollTrigger.removeEventListener('refresh', syncBeats)
    }
  }, [])

  // scene readiness soft-fades the canvas wrapper in beneath the content;
  // a failed frame-budget probe swaps to the static fallback.
  useEffect(() => {
    if (showStatic || !mountScene) return
    const un = sceneEvents.subscribe((v) => {
      if (v) {
        setSceneReady(true)
        refreshScrollTriggers()
      } else {
        setSceneFailed(true)
        refreshScrollTriggers()
      }
    })
    return un
  }, [showStatic, mountScene])

  // Watchdog: if the scene chunk never becomes ready (slow network, failed
  // import, stalled GPU), fall back rather than leaving an empty canvas.
  useEffect(() => {
    if (!mountScene || sceneReady) return
    let t: number | undefined
    // Only count loading time while the tab is visible: rAF is throttled in
    // hidden/prerendered tabs, so the scene legitimately cannot warm up there.
    const arm = () => {
      if (document.hidden) return
      t = window.setTimeout(() => setSceneFailed(true), 15000)
    }
    const onVis = () => {
      if (t) window.clearTimeout(t)
      t = undefined
      arm()
    }
    arm()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      if (t) window.clearTimeout(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [mountScene, sceneReady])

  // scroll choreography: master progress, hero exit, alternating reveals, parallax
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          scrollBus.progress = self.progress
        },
      })

      // hero copy exits naturally as the viewport leaves the hero
      gsap.to('[data-hero-exit]', {
        yPercent: -12,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 4%', scrub: true },
      })

      // sections arrive on alternating vectors with a tiny stagger between rows
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el, i) => {
        const v = REVEAL_VARIANTS[(el.dataset.reveal as RevealName) || 'up']
        gsap.fromTo(
          el,
          {
            autoAlpha: 0,
            x: v.x,
            y: v.y,
            scale: v.scale,
            rotationX: v.rotationX,
            transformPerspective: 900,
            transformOrigin: '50% 0%',
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration: 1.05,
            ease: 'power3.out',
            delay: (i % 4) * 0.07,
            scrollTrigger: { trigger: el, start: 'top 87%', once: true },
          },
        )
      })

      // deepest layers drift at their own speed — parallax at multiple depths
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const depth = Math.min(0.22, Math.max(0.04, parseFloat(el.dataset.depth || '0.1')))
        gsap.fromTo(
          el,
          { yPercent: -depth * 18 },
          {
            yPercent: depth * 18,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  // cinematic hero entrance — each element arrives on its own beat
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      // 3. glass cards enter from different depths
      gsap.fromTo(
        '[data-hero-card]',
        { opacity: 0, y: (i: number) => 84 + (i % 2) * 48, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.35,
          ease: 'power3.out',
          stagger: { each: 0.12, from: 'end' },
          delay: 0.55,
        },
      )

      // 4. hero typography rises via CSS (`@keyframes hero-rise`) — the
      // reveal never depends on the JS ticker, so it can't be left hidden.

      // supporting layer
      gsap.fromTo(
        '[data-hero-support]',
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.14, delay: 1.3 },
      )

      // 5. CTA appears last
      gsap.fromTo(
        '[data-hero-cta]',
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 1.65 },
      )

      // The card idle-float lives in CSS (@keyframes card-float) so it never
      // costs a JS ticker write — only the entrance below runs through GSAP.

      gsap.delayedCall(2.8, () => ScrollTrigger.refresh())
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div
      ref={rootRef}
      data-scene-state={showStatic ? 'static' : mountScene ? (sceneReady ? 'ready' : 'mounting') : 'idle'}
      className="relative min-h-screen overflow-x-clip bg-ink text-bone antialiased"
    >
      {/* boot curtain — a fixed beat; it never waits on the 3D layer */}
      {!curtainGone && (
        <div
          data-loader
          className={`fixed inset-0 z-[55] transition-opacity duration-700 ${
            curtainFade ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <Loader />
        </div>
      )}

      {/* architectural WebGL layer OR static fallback */}
      {showStatic ? (
        <StaticFallback />
      ) : mountScene ? (
        <div
          data-canvas-wrap
          className={`fixed inset-0 z-0 transition-opacity duration-[1400ms] ease-out ${
            sceneReady ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        >
          <SceneErrorBoundary onFail={() => setSceneFailed(true)}>
            <Suspense fallback={null}>
              <SceneCanvas />
            </Suspense>
          </SceneErrorBoundary>
        </div>
      ) : null}

      <main className="pointer-events-none relative z-10">
        <Nav />
        <Hero />
        <ServicesSection />
        <Testimonials />
        <Contact />
      </main>

      <AskPillars />
      <div className="grain" aria-hidden="true" />
    </div>
  )
}

class SceneErrorBoundary extends Component<
  { onFail: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('WebGL scene failed, falling back to static visuals.', error, info)
    this.props.onFail()
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}