import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { deviceBus, scrollBus, smoothstep } from '../../lib/bus'

type Monolith = { pos: [number, number]; h: number; w: number }

export function SecondaryStructures() {
  const { mobile } = deviceBus

  const MONOLITHS: Monolith[] = [
    { pos: [4.0, 2.6], h: 2.3, w: 0.6 },
    { pos: [5.7, 1.0], h: 3.1, w: 0.7 },
    { pos: [5.2, -1.4], h: 2.7, w: 0.6 },
    { pos: [3.4, -2.7], h: 2.1, w: 0.5 },
  ]

  const slitMats = useRef<(THREE.MeshBasicMaterial | null)[]>([])

  const farColumns = useMemo(
    () =>
      [
        { pos: [-4.7, -1.6], h: 2.0, w: 0.32 },
        { pos: [-3.6, 2.2], h: 1.7, w: 0.3 },
      ] as Monolith[],
    [],
  )

  useFrame(() => {
    if (mobile || deviceBus.reduced) return
    const p = scrollBus.progress
    slitMats.current.forEach((m, i) => {
      if (!m) return
      const a = 0.16 + i * 0.1
      const b = a + 0.12
      const glow = smoothstep(a, b, p)
      m.opacity = glow * 0.75
    })
  })

  const buildMonolith = (m: Monolith, i: number) => (
    <group key={`mono-${i}`} position={[m.pos[0], 0, m.pos[1]]}>
      <RoundedBox args={[m.w + 0.42, 0.18, m.w + 0.42]} radius={0.05} smoothness={2} position={[0, 0.09, 0]}>
        <meshStandardMaterial color="#101313" metalness={0.62} roughness={0.5} envMapIntensity={0.5} />
      </RoundedBox>
      <RoundedBox args={[m.w, m.h, m.w]} radius={0.05} smoothness={2} position={[0, 0.09 + m.h / 2, 0]} castShadow={!mobile}>
        <meshStandardMaterial color="#151818" metalness={0.7} roughness={0.36} envMapIntensity={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.09 + m.h / 2, m.w / 2 + 0.011]}>
        <boxGeometry args={[0.045, m.h * 0.62, 0.045]} />
        <meshBasicMaterial
          ref={(el) => { slitMats.current[i] = el }}
          color="#c8ff3d"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )

  return (
    <group>
      {MONOLITHS.map((m, i) => buildMonolith(m, i))}
      {farColumns.map((m, i) => (
        <group key={`far-${i}`} position={[m.pos[0], 0, m.pos[1]]}>
          <RoundedBox args={[m.w, m.h, m.w]} radius={0.04} smoothness={2} position={[0, 0.03 + m.h / 2, 0]}>
            <meshStandardMaterial color="#111414" metalness={0.7} roughness={0.4} envMapIntensity={0.4} />
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}
