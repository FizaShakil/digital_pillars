import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { deviceBus, scrollBus } from '../../lib/bus'
import { getGlowTexture, getGridTexture } from './textures'

export function FloorGrid() {
  const grid = getGridTexture()
  const glow = getGlowTexture()
  const ringRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const l = Math.min(1, Math.max(0, (scrollBus.progress - 0.08) / 0.3))
    if (ringRef.current) {
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = l * 0.14
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = l * 0.07
    }
  })

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshBasicMaterial
          map={grid}
          color="#3b413f"
          transparent
          opacity={0.24}
          depthWrite={false}
          fog
        />
      </mesh>

      <mesh position={[0, 0.015, 0]} receiveShadow={!deviceBus.mobile}>
        <cylinderGeometry args={[3.6, 3.8, 0.05, 48]} />
        <meshStandardMaterial
          color="#101313"
          metalness={0.65}
          roughness={0.5}
          envMapIntensity={0.4}
        />
      </mesh>

      <mesh ref={ringRef} rotation-x={-Math.PI / 2} position={[0, 0.045, 0]}>
        <ringGeometry args={[3.7, 3.78, 72]} />
        <meshBasicMaterial
          color="#c8ff3d"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={glowRef} rotation-x={-Math.PI / 2} position={[0, 0.06, 0]}>
        <planeGeometry args={[7, 7]} />
        <meshBasicMaterial
          map={glow}
          color="#c8ff3d"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
