/**
 * Lightweight shared state passed between the DOM world (GSAP / ScrollTrigger)
 * and the r3f render loop. Mutating plain objects avoids re-renders —
 * the WebGL frame reads these each tick; GSAP writes them on scroll.
 */

export interface BusMessage {
  /** phase of the 3D scene entrance, 0..1 (driven inside the canvas) */
  intro: number
  /** global scroll progress 0..1 over the whole document */
  progress: number
  /** 0..1 progress through the fixed scene window (hero exit -> services) */
  sceneExit: number
  /** true once the hero intro has played */
  entered: boolean
  /**
   * Scroll fractions where each camera keyframe should land, measured from the
   * real DOM layout at runtime (App rewrites this on every ScrollTrigger refresh).
   * Length always matches the CameraRig BEATS table; a fresh module boots with
   * estimated fractions so the scene composes even before the DOM is measured.
   */
  beats: number[]
}

export const scrollBus: BusMessage = {
  intro: 0,
  progress: 0,
  sceneExit: 0,
  entered: false,
  beats: [0.0, 0.12, 0.22, 0.36, 0.52, 0.72, 1.0],
}

/** Normalised pointer (-1..1) for parallax — populated only on hover devices. */
export const pointerBus = {
  x: 0,
  y: 0,
  active: false,
}

export interface DeviceFlags {
  mobile: boolean
  hover: boolean
  reduced: boolean
  webgl: boolean
  /** `?scene=1` / localStorage flag — force the 3D layer even in automation. */
  forceScene: boolean
}

/** Captured once at boot and mirrored for components that mount later. */
export const deviceBus: DeviceFlags = {
  mobile: false,
  hover: true,
  reduced: false,
  webgl: true,
  forceScene: false,
}

type SceneListener = (ready: boolean) => void
const sceneListeners = new Set<SceneListener>()

export const sceneEvents = {
  ready: false,
  /** receive the moment the 3D scene reports itself fully loaded / mounted */
  subscribe(fn: SceneListener): () => void {
    sceneListeners.add(fn)
    if (sceneEvents.ready) fn(true)
    return () => {
      sceneListeners.delete(fn)
    }
  },
  setReady(ready: boolean): void {
    sceneEvents.ready = ready
    sceneListeners.forEach((fn) => fn(ready))
  },
}

/** Eased step helper for keyframe animation tables. */
export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}