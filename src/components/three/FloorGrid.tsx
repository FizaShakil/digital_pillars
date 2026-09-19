import * as THREE from 'three'
import { deviceBus } from '../../lib/bus'
import { getGlowTexture, getGridTexture } from './textures'

/**
 * Ground plane with a fine architectural grid, a low graphite pedestal and a
 * restrained lime glow that grounds the pillar (additive, very dim).
 */
export function FloorGrid() {
  const grid = getGridTexture()
  const glow = getGlowTexture()

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

      {/* pedestal */}
      <mesh position={[0, 0.015, 0]} receiveShadow={!deviceBus.mobile}>
        <cylinderGeometry args={[3.6, 3.8, 0.05, 48]} />
        <meshStandardMaterial
          color="#101313"
          metalness={0.65}
          roughness={0.5}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* thin accent ring around the pedestal */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.045, 0]}>
        <ringGeometry args={[3.7, 3.78, 72]} />
        <meshBasicMaterial
          color="#c8ff3d"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* grounding glow — barely visible, just anchors the pillar */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.06, 0]}>
        <planeGeometry args={[7, 7]} />
        <meshBasicMaterial
          map={glow}
          color="#c8ff3d"
          transparent
          opacity={0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}