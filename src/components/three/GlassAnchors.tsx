import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { deviceBus, scrollBus, smoothstep } from '../../lib/bus'
import { getGlowTexture } from './textures'

const MAX_ANCHORS = 2

/**
 * 3D ↔ glass integration.
 *
 * The floating DOM glass cards are real portals into the scene: this rig
 * projects each card's on-screen centre into world space and hangs a soft
 * additive light pool exactly behind it. Because the cards sit above the
 * canvas with `backdrop-filter`, the pools read as the scene lighting the
 * glass — the cards are no longer pasted on top, they occupy the space.
 *
 * Cost is deliberately tiny: four 1×1 quads, one shared sprite, positions
 * smoothed at a fraction of the frame rate and skipped once the hero scrolls
 * out.
 */
export function GlassAnchors() {
  const { camera } = useThree()
  const group = useRef<THREE.Group>(null)
  const meshes = useRef<(THREE.Mesh | null)[]>([])
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const cards = useRef<HTMLElement[]>([])
  const ndc = useRef(new THREE.Vector3())
  const tick = useRef(0)

  const glow = getGlowTexture()

  useFrame((_, dt) => {
    if (deviceBus.reduced || !group.current) return
    if (cards.current.length === 0) {
      cards.current = Array.from(
        document.querySelectorAll<HTMLElement>('[data-hero-card]'),
      ).slice(0, MAX_ANCHORS)
    }

    // hero visibility window: fade in with the intro, out as the hero exits
    const intro = scrollBus.intro
    const beat = scrollBus.beats.length > 1 ? scrollBus.beats[1] : 0.12
    const fade = intro * (1 - smoothstep(beat, beat + 0.09, scrollBus.progress))

    group.current.visible = fade > 0.01
    if (!group.current.visible) return

    // resample screen positions only every few frames (layout reads are not free)
    tick.current += 1
    const resample = tick.current % 4 === 0 || tick.current === 1
    const vw = window.innerWidth
    const vh = window.innerHeight

    for (let i = 0; i < MAX_ANCHORS; i++) {
      const mesh = meshes.current[i]
      const mat = mats.current[i]
      if (!mesh || !mat) continue
      const card = cards.current[i]
      if (!card) {
        mesh.visible = false
        continue
      }

      if (resample) {
        const r = card.getBoundingClientRect()
        if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh) {
          mesh.visible = true
          ndc.current
            .set(((r.left + r.width / 2) / vw) * 2 - 1, -((r.top + r.height / 2) / vh) * 2 + 1, 0.45)
            .unproject(camera)
          mesh.userData.tx = ndc.current.x
          mesh.userData.ty = ndc.current.y
          mesh.userData.tz = ndc.current.z
          mesh.userData.scale = 0.9 + Math.min(1, r.width / 420) * 0.8
        } else {
          mesh.visible = false
        }
      }

      if (!mesh.visible) continue

      const k = 1 - Math.exp(-dt * 5)
      mesh.position.x += ((mesh.userData.tx as number) - mesh.position.x) * k
      mesh.position.y += ((mesh.userData.ty as number) - mesh.position.y) * k
      mesh.position.z += ((mesh.userData.tz as number) - mesh.position.z) * k
      const s = mesh.userData.scale as number
      mesh.scale.setScalar(s)
      mesh.quaternion.copy(camera.quaternion)
      mat.opacity = 0.06 * fade
    }
  })

  return (
    <group ref={group}>
      {Array.from({ length: MAX_ANCHORS }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el
          }}
          renderOrder={3}
          visible={false}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            ref={(el) => {
              mats.current[i] = el
            }}
            map={glow}
            color="#c8ff3d"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      ))}
    </group>
  )
}
