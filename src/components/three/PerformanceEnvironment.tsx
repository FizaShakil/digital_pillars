import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { deviceBus } from '../../lib/bus'

/**
 * Studio lighting built entirely in code. The PMREM environment that gives
 * the graphite its soft premium reflections is constructed in the Canvas
 * `onCreated` hook (SceneCanvas) — no external HDR assets.
 *
 * The two key lights drift on very slow Lissajous paths so the scene feels
 * alive at rest (subtle specular shimmer) without any movement cost.
 */
export function PerformanceEnvironment() {
  const { mobile, reduced } = deviceBus
  const rim = useRef<THREE.DirectionalLight>(null)
  const accentRef = useRef<THREE.PointLight>(null)
  const fill = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (reduced) return
    const t = state.clock.elapsedTime
    const amp = mobile ? 0.3 : 0.6
    if (rim.current) {
      rim.current.position.set(
        -7 + Math.sin(t * 0.18) * 1.8,
        3 + Math.cos(t * 0.13) * 0.5,
        -6 + Math.sin(t * 0.21 + 1) * 1.4,
      )
    }
    if (accentRef.current) {
      accentRef.current.position.set(
        Math.sin(t * 0.24 + 2) * 1.4 * amp,
        3.4 + Math.sin(t * 0.16) * 0.25,
        1.2 + Math.cos(t * 0.27) * 1.1 * amp,
      )
    }
    if (fill.current) {
      fill.current.position.set(
        2 + Math.sin(t * 0.11) * 1.0,
        1 + Math.cos(t * 0.14) * 0.3,
        3 + Math.sin(t * 0.09 + 2) * 0.8,
      )
    }
  })

  return (
    <>
      <fog attach="fog" args={['#070808', 12, 34]} />
      <ambientLight intensity={0.12} />
      <hemisphereLight args={['#3d4341', '#0c0e0d', 0.55]} />
      <directionalLight
        position={[6, 9, 4]}
        intensity={2.4}
        color="#f2f2ed"
        castShadow={!mobile}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={26}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />
      {/* lime rim sculpts the silhouette of the graphite pillar (drifting) */}
      <directionalLight ref={rim} position={[-7, 3, -6]} intensity={0.6} color="#c8ff3d" />
      <pointLight ref={accentRef} position={[0, 3.4, 1.2]} intensity={2.2} color="#c8ff3d" distance={5} decay={2.2} />
      {/* fill light is a desktop affordance — phones drop it to cut shading cost */}
      {!mobile && (
        <pointLight ref={fill} position={[2, 1, 3]} intensity={0.5} color="#f2f2ed" distance={9} decay={2.4} />
      )}
    </>
  )
}