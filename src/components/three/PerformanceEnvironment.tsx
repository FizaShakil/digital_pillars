import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { deviceBus, scrollBus } from '../../lib/bus'

export function PerformanceEnvironment() {
  const { mobile } = deviceBus
  const rim = useRef<THREE.DirectionalLight>(null)
  const accentRef = useRef<THREE.PointLight>(null)
  const fill = useRef<THREE.PointLight>(null)
  const limeRef = useRef(0)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const amp = mobile ? 0.3 : 0.6

    const lime = Math.min(1, Math.max(0, (scrollBus.progress - 0.05) / 0.3))
    limeRef.current += (lime - limeRef.current) * 0.06
    const l = limeRef.current

    if (rim.current) {
      rim.current.position.set(
        -7 + Math.sin(t * 0.18) * 1.8,
        3 + Math.cos(t * 0.13) * 0.5,
        -6 + Math.sin(t * 0.21 + 1) * 1.4,
      )
      rim.current.intensity = l * 0.3
    }
    if (accentRef.current) {
      accentRef.current.position.set(
        Math.sin(t * 0.24 + 2) * 1.4 * amp,
        4.0 + Math.sin(t * 0.16) * 0.25,
        0.5 + Math.cos(t * 0.27) * 0.8 * amp,
      )
      accentRef.current.intensity = l * 0.5
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
      <fog attach="fog" args={['#070808', 8, 26]} />
      <ambientLight intensity={0.1} />
      <hemisphereLight args={['#505553', '#0a0b0a', 0.45]} />
      <directionalLight
        position={[6, 9, 4]}
        intensity={2.8}
        color="#f2f2ed"
        castShadow={!mobile}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-near={1}
        shadow-camera-far={26}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />
      <directionalLight ref={rim} position={[-7, 3, -6]} intensity={0} color="#c8ff3d" />
      <pointLight ref={accentRef} position={[0, 4.0, 0.5]} intensity={0} color="#c8ff3d" distance={6} decay={2.8} />
      {!mobile && (
        <pointLight ref={fill} position={[2, 1, 3]} intensity={0.5} color="#f2f2ed" distance={9} decay={2.4} />
      )}
    </>
  )
}
