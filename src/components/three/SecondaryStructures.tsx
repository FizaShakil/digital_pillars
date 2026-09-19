import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { deviceBus, scrollBus, smoothstep } from '../../lib/bus'
import { AccentLine } from './AccentLine'

type Monolith = { pos: [number, number]; h: number; w: number }

/**
 * Four quiet service monoliths arranged on a shallow arc to the right of the
 * hero pillar. Each carries a vertical emissive slit that "wakes up" in
 * sequence as the camera orbits during the services section — a 3D echo of
 * the DOM service list. Two far gate arcs close the depth behind them.
 */
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

  const arcPoints = useMemo(() => {
    const mk = (x: number, z: number, span: number, height: number): [number, number, number][] => {
      const pts: [number, number, number][] = []
      for (let i = 0; i <= 24; i++) {
        const t = i / 24
        // quadratic-ish arch
        pts.push([x + span * (t - 0.5), height * Math.sin(Math.PI * t), z])
      }
      return pts
    }
    return [mk(-2.4, -4.8, 4.6, 4.4), mk(2.4, -4.8, 4.6, 4.4)]
  }, [])

  useFrame(() => {
    if (mobile || deviceBus.reduced) return
    const p = scrollBus.progress
    // the services band begins once the hero exits (~p .16) — by p .55 it is done
    slitMats.current.forEach((m, i) => {
      if (!m) return
      const a = 0.16 + i * 0.1
      const b = a + 0.12
      const glow = smoothstep(a, b, p)
      m.opacity = 0.12 + glow * 0.75
    })
  })

  const buildMonolith = (m: Monolith, i: number) => (
    <group key={`mono-${i}`} position={[m.pos[0], 0, m.pos[1]]}>
      {/* plinth */}
      <RoundedBox args={[m.w + 0.42, 0.18, m.w + 0.42]} radius={0.05} smoothness={2} position={[0, 0.09, 0]}>
        <meshStandardMaterial color="#101313" metalness={0.62} roughness={0.5} envMapIntensity={0.5} />
      </RoundedBox>
      {/* column */}
      <RoundedBox args={[m.w, m.h, m.w]} radius={0.05} smoothness={2} position={[0, 0.09 + m.h / 2, 0]} castShadow={!mobile}>
        <meshStandardMaterial color="#151818" metalness={0.7} roughness={0.36} envMapIntensity={0.55} />
      </RoundedBox>
      {/* vertical emissive slit */}
      <mesh position={[0, 0.09 + m.h / 2, m.w / 2 + 0.011]}>
        <boxGeometry args={[0.045, m.h * 0.62, 0.045]} />
        <meshBasicMaterial
          ref={(el) => {
            slitMats.current[i] = el
          }}
          color="#c8ff3d"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* slim ring */}
      <mesh position={[0, m.h + 0.09, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[m.w * 0.62, 0.006, 8, 40]} />
        <meshBasicMaterial color="#c8ff3d" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )

  return (
    <group>
      {MONOLITHS.map((m, i) => buildMonolith(m, i))}
      {/* faint far columns */}
      {farColumns.map((m, i) => (
        <group key={`far-${i}`} position={[m.pos[0], 0, m.pos[1]]}>
          <RoundedBox args={[m.w, m.h, m.w]} radius={0.04} smoothness={2} position={[0, 0.03 + m.h / 2, 0]}>
            <meshStandardMaterial color="#111414" metalness={0.7} roughness={0.4} envMapIntensity={0.4} />
          </RoundedBox>
        </group>
      ))}
      {/* arch frames closing the depth */}
      {arcPoints.map((pts, i) => (
        <AccentLine key={`arc-${i}`} points={pts} opacity={0.14} />
      ))}
    </group>
  )
}