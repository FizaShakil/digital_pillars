import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { deviceBus, scrollBus } from '../../lib/bus'

let lastHot = 0

/*
 * Frame-budget probe — a backstop for the GPU-tier gate in `lib/gpu.ts`.
 *
 * The primary capability decision (software rasterizer? automated? measured
 * GPU fill time?) happens before we ever mount the canvas. This probe exists
 * only to catch a device that passed that gate but still cannot hold a real
 * render cadence once the scene is live. It is deliberately conservative:
 *  - WARM UP first: the first frames include shader compilation, environment
 *    baking and the first draw call. Sampling them tore the building down.
 *  - Judge a WINDOW: use the window median and its over-budget ratio, so a GC
 *    hitch or a reflow never flips the verdict.
 *  - Demote only on SUSTAINED failure (several consecutive bad windows),
 *    which a working scene on a warm machine will never produce.
 *  - When in doubt, keep the scene: an ambiguous window counts as healthy and
 *    a hard ceiling fades the canvas in rather than leaving it empty.
 */
const FRAME_BUDGET = 46 // ms — below ~21fps is no longer cinematic
const WARMUP_MS = 1200 // let shaders compile / environment bake / fonts settle
const WARMUP_FRAMES = 14
const WINDOW = 40 // frames per verdict window
const GOOD_RATIO = 0.3 // < 30% over budget => healthy
const BAD_RATIO = 0.6 // > 60% over budget => failing window
const SUSTAIN = 3 // consecutive failing windows before demoting
const PROBE_CEILING_MS = 5000 // never leave the canvas hidden longer than this

/**
 * Demand-driven frameloop ("render only when something happened").
 *
 * The Canvas runs on `frameloop="demand"`; this driver decides when a frame
 * is warranted:
 *  - while the hero intro is playing, the user is scrolling, or the pointer is
 *    moving → a full 60fps cadence (every rAF invalidates),
 *  - while idle → a slow ambient tick keeps the light/particle drift alive
 *    without paying for a permanent render loop. The interval is deliberately
 *    long (320ms, ~3fps): once idle, every extra frame is a potential long
 *    task, and the drift is far too subtle to need more.
 *
 * It also owns the readiness verdict: once the scene has warmed up and holds
 * budget it reports `onProbe(true)` (the canvas soft-fades in), and only after
 * sustained over-budget windows does it report `onProbe(false)` (the app swaps
 * to the static layer).
 */
export function PacedLoop({ onProbe }: { onProbe?: (ok: boolean) => void }) {
  const invalidate = useThree((s) => s.invalidate)
  const setDpr = useThree((s) => s.setDpr)
  const probeRef = useRef(onProbe)
  useEffect(() => {
    probeRef.current = onProbe
  })

  useEffect(() => {
    const mark = () => {
      lastHot = performance.now()
    }
    addEventListener('scroll', mark, { passive: true })
    addEventListener('pointermove', mark, { passive: true })

    let rafId = 0
    let lastIdleRender = 0
    let prevT = performance.now()
    let hotFrames = 0
    let badWindows = 0
    let verdictSent = false
    let dprTrimmed = false
    const probeStart = performance.now()
    const buf: number[] = []

    const settle = (ok: boolean) => {
      if (verdictSent) return
      verdictSent = true
      probeRef.current?.(ok)
    }

    const loop = () => {
      rafId = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = now - prevT
      prevT = now

      const hot = scrollBus.intro < 1 || now - lastHot < 320

      // Sample only real render frames; the ~320ms idle tick is not a frame
      // cost and must never be mistaken for one.
      if (hot && !verdictSent) {
        hotFrames += 1
        const warmed = hotFrames >= WARMUP_FRAMES && now - probeStart >= WARMUP_MS
        if (warmed) {
          buf.push(dt)
          if (buf.length >= WINDOW) {
            const sorted = [...buf].sort((a, b) => a - b)
            const median = sorted[sorted.length >> 1]
            let over = 0
            for (const v of buf) if (v > FRAME_BUDGET) over += 1
            const ratio = over / buf.length
            buf.length = 0

            if (median <= FRAME_BUDGET && ratio < GOOD_RATIO) {
              // Profiling result: when frames are healthy but the margin is
              // thin, dial the render resolution back once (never up) so the
              // scene keeps its headroom instead of being demoted later.
              if (!dprTrimmed && median > FRAME_BUDGET * 0.55) {
                dprTrimmed = true
                setDpr(deviceBus.mobile ? 1 : 1.25)
              }
              settle(true)
            } else if (ratio > BAD_RATIO) {
              badWindows += 1
              if (badWindows >= SUSTAIN) settle(false)
            } else {
              // ambiguous window: give the scene the benefit of the doubt
              settle(true)
            }
          }
        }
      }

      // Hard ceiling: if the scene is still running but the probe never
      // reached a verdict, fade it in rather than leave an empty canvas.
      if (!verdictSent && now - probeStart > PROBE_CEILING_MS) settle(true)

      if (hot) {
        invalidate()
      } else if (now - lastIdleRender > 320) {
        lastIdleRender = now
        invalidate()
      }
    }
    rafId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafId)
      removeEventListener('scroll', mark)
      removeEventListener('pointermove', mark)
    }
  }, [invalidate, setDpr])

  return null
}
