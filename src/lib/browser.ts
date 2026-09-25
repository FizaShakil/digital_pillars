import { useEffect, useState } from 'react'
import { deviceBus } from './bus'

export type DeviceInfo = {
  mobile: boolean
  hover: boolean
  reduced: boolean
  webgl: boolean
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { mobile: false, hover: true, reduced: false, webgl: true }
  }
  const mq = (q: string) => window.matchMedia(q)
  const reduced = mq('(prefers-reduced-motion: reduce)').matches
  const hover = mq('(hover: hover) and (pointer: fine)').matches
  const coarse = mq('(pointer: coarse)').matches
  const mobile = coarse || mq('(max-width: 767px)').matches
  return { mobile, hover, reduced, webgl: webglCapable() }
}

export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * Detect pure-software rasterizers (SwiftShader, llvmpipe, GPU-less browsers)
 * by name. Complements the timed GPU probe in `lib/gpu.ts`, which is the real
 * capability decision — this is the cheap string-based early exit.
 */
export function isSoftwareRenderer(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null)
    if (!gl) return true
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const name = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || gl.getParameter(gl.RENDERER))
      : ''
    const lose = gl.getExtension('WEBGL_lose_context')
    lose?.loseContext()
    return /swiftshader|llvmpipe|softpipe|software\.render/i.test(name)
  } catch {
    return false
  }
}

/**
 * Headless/automation browsers (Selenium, Puppeteer, CI, Lighthouse with
 * `--enable-automation`) have no real viewer and often no GPU pipeline — they
 * get the lean static layer. Real browsers always get the cinematic scene;
 * `?scene=1` (or the localStorage flag) overrides this for QA.
 */
export function isAutomationBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.webdriver === true
}

/** `?scene=1` on the URL (or the localStorage flag) forces the 3D layer on.
 *  Dev environments (localhost / 127.0.0.1) also auto-enable so the scene
 *  is visible during development without extra flags. */
export function sceneForced(): boolean {
  try {
    if (typeof window === 'undefined') return false
    if (localStorage.getItem('dp-force-scene') === '1') return true
    if (new URLSearchParams(window.location.search).get('scene') === '1') return true
    // auto-enable on dev servers so the scene is always visible during development
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return true
    return false
  } catch {
    return false
  }
}

/** The cinematic layer runs for real browsers with WebGL; `?scene=1` overrides for QA.
 *  The timed render probe kept on `lib/gpu.ts` is intentionally NOT part of this
 *  gate: creating/compiling a WebGL context on the boot path blocks first paint
 *  on weak machines. Capability is a cheap context probe here; sustained-frame
 *  health is judged at runtime by `PacedLoop`, which demotes to the static layer. */
export function webglCapable(): boolean {
  if (typeof window === 'undefined') return true
  if (sceneForced()) return true
  return supportsWebGL()
}

interface Listeners {
  [query: string]: (e: MediaQueryListEvent) => void
}

/** React hook mirroring a matchMedia query. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(query)
    const fn: Listeners[string] = (e) => setMatches(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [query])

  return matches
}

export function useHoverDevice(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Boot-time device flags (immutable after load) also mirrored into deviceBus. */
export function initDevice(): DeviceInfo {
  const info = detectDevice()
  deviceBus.mobile = info.mobile
  deviceBus.hover = info.hover
  deviceBus.reduced = info.reduced
  deviceBus.webgl = info.webgl
  deviceBus.forceScene = sceneForced()
  return info
}