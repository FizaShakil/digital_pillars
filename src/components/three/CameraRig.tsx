import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { deviceBus, pointerBus, scrollBus } from '../../lib/bus'

type KF = { p: number; pos: THREE.Vector3; look: THREE.Vector3 }

/**
 * Story beats for the camera. `p` values here are boot-time *estimates* used
 * only until App measures the real page layout — after the first ScrollTrigger
 * refresh `scrollBus.beats` carries the actual fractions where each beat lands
 * (hero centre, hero base, services, detail panel, studio, contact, deepest).
 * Between beats the camera interpolates, and each frame it is damped toward
 * the target so the motion always feels pushed rather than quantised.
 *
 * All positions are pre-built Vector3s and interpolation writes into reused
 * scratch vectors — the rig allocates nothing per frame.
 */
const BEATS: KF[] = [
  { p: 0.0, pos: new THREE.Vector3(0, 2.05, 8.4), look: new THREE.Vector3(0, 2.0, 0) },
  { p: 0.12, pos: new THREE.Vector3(1.4, 2.0, 7.6), look: new THREE.Vector3(0.5, 2.0, -0.2) },
  { p: 0.22, pos: new THREE.Vector3(4.4, 1.9, 5.4), look: new THREE.Vector3(2.6, 1.9, -0.6) },
  { p: 0.36, pos: new THREE.Vector3(3.6, 2.25, 5.7), look: new THREE.Vector3(2.0, 2.1, 0.2) },
  { p: 0.52, pos: new THREE.Vector3(0.5, 2.5, 6.7), look: new THREE.Vector3(0, 2.2, 0) },
  { p: 0.72, pos: new THREE.Vector3(0, 2.6, 7.3), look: new THREE.Vector3(0, 2.3, 0) },
  { p: 1.0, pos: new THREE.Vector3(0, 2.35, 7.8), look: new THREE.Vector3(0, 2.2, 0) },
]

const DEFAULT_BEATS = BEATS.map((b) => b.p)

/** Writes the interpolated position / look into the supplied scratch vectors. */
function sample(p: number, beats: number[], outPos: THREE.Vector3, outLook: THREE.Vector3) {
  const t = Math.min(1, Math.max(0, p))
  let i = 0
  for (; i < BEATS.length - 2; i++) {
    if (t >= beats[i] && t <= beats[i + 1]) break
  }
  const a = BEATS[i]
  const b = BEATS[i + 1]
  const span = Math.max(1e-4, beats[i + 1] - beats[i])
  const f = Math.min(1, Math.max(0, (t - beats[i]) / span))
  outPos.lerpVectors(a.pos, b.pos, f)
  outLook.lerpVectors(a.look, b.look, f)
}

/**
 * Drives the camera along the story path. On mobile the orbit is flattened
 * and pulled closer — a deliberate, simpler composition rather than a
 * shrunk desktop one.
 */
export function CameraRig() {
  const lookTarget = useRef(new THREE.Vector3(0, 2, 0))
  const scratchPos = useRef(new THREE.Vector3())
  const scratchLook = useRef(new THREE.Vector3())

  useFrame((state, dt) => {
    const cam = state.camera as THREE.PerspectiveCamera

    const { mobile, reduced } = deviceBus
    const beats = scrollBus.beats.length === BEATS.length ? scrollBus.beats : DEFAULT_BEATS
    const sPos = scratchPos.current
    const sLook = scratchLook.current
    sample(scrollBus.progress, beats, sPos, sLook)

    // entrance push-in, then dwarfed by the settle
    sPos.z += (1 - scrollBus.intro) * 0.9
    if (reduced) {
      cam.position.lerp(sPos, 0.5)
      lookTarget.current.lerp(sLook, 0.5)
    } else {
      // mobile: tighter framing, gentler arcs
      const xScale = mobile ? 0.55 : 1
      const zScale = mobile ? 0.82 : 1
      sPos.x *= xScale
      sPos.z *= zScale + 0.02
      sLook.x *= mobile ? 0.7 : 1

      // idle: extremely subtle drift + pointer parallax (hover devices only)
      const t = state.clock.elapsedTime
      if (!mobile && pointerBus.active) {
        sLook.x += pointerBus.x * 0.12
        sLook.y += pointerBus.y * 0.07
      }
      sLook.x += Math.sin(t * 0.2) * 0.03
      sLook.y += Math.sin(t * 0.24 + 1) * 0.02

      const k = 1 - Math.exp(-dt * 2.6)
      cam.position.lerp(sPos, k)
      lookTarget.current.lerp(sLook, k)
    }
    cam.lookAt(lookTarget.current)
  })

  return null
}
