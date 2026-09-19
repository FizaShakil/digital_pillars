import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { deviceBus } from '../../lib/bus'
import { getParticleSprite } from './textures'

function makeField(
  count: number,
  bounds: [number, number],
  yMax: number,
  zClamp = 0.6,
) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // deterministic-ish scatter with a softer pool near the pillar
    const rr = Math.pow(Math.random(), 0.75)
    positions[i * 3] = (Math.random() * 2 - 1) * bounds[0] * rr
    positions[i * 3 + 1] = Math.random() * yMax
    positions[i * 3 + 2] = (Math.random() * 2 - 1) * bounds[1] * rr * zClamp
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return g
}

/**
 * Two restrained point clouds:
 *  - a fine "dust" layer (bone) floating around the environment
 *  - a tiny lime "data mote" layer that drifts in slow circles
 * Counts are intentionally low and reduced again on mobile.
 */
export function ParticleField() {
  const { mobile, reduced } = deviceBus
  const dustCount = mobile ? 50 : 120
  const emberCount = mobile ? 8 : 16

  const dustGeo = useMemo(() => makeField(dustCount, [15, 6], 9), [dustCount])
  const emberGeo = useMemo(() => makeField(emberCount, [4, 2.2], 5), [emberCount])

  const sprite = getParticleSprite()
  const dustGroup = useRef<THREE.Group>(null)
  const emberGroup = useRef<THREE.Group>(null)
  const dustMat = useRef<THREE.PointsMaterial>(null)

  useFrame((state, dt) => {
    if (reduced) return
    const t = state.clock.elapsedTime
    if (dustGroup.current) {
      dustGroup.current.rotation.y += dt * 0.006
      dustGroup.current.position.y = Math.sin(t * 0.1) * 0.12
    }
    if (emberGroup.current) {
      // restrained orbital drift around the pillar
      emberGroup.current.rotation.y -= dt * 0.02
      emberGroup.current.position.y = Math.sin(t * 0.16 + 1) * 0.14
    }
    if (dustMat.current) {
      dustMat.current.opacity = 0.3 + Math.sin(t * 0.22) * 0.04
    }
  })

  return (
    <group>
      <group ref={dustGroup}>
        <points geometry={dustGeo} frustumCulled={false}>
          <pointsMaterial
            ref={dustMat}
            map={sprite}
            color="#b9c0bd"
            size={0.05}
            sizeAttenuation
            transparent
            opacity={0.3}
            depthWrite={false}
            fog
          />
        </points>
      </group>
      <group ref={emberGroup}>
        <points geometry={emberGeo} frustumCulled={false}>
          <pointsMaterial
            map={sprite}
            color="#c8ff3d"
            size={0.025}
            sizeAttenuation
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </group>
  )
}