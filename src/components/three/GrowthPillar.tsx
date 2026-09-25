import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { deviceBus, scrollBus, smoothstep } from '../../lib/bus'

type Layer = { width: number; y: number; x: number; z: number; yaw: number }

const SLABS = 8
const PITCH = 0.54

// Shared accent materials — module constants (not React state) so per-frame
// opacity writes are plain three.js, created once for the app lifetime.
const ringMat = new THREE.MeshBasicMaterial({
  color: '#c8ff3d',
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
})
const nodeMat = new THREE.MeshBasicMaterial({ color: '#c8ff3d', transparent: true, opacity: 0 })

function buildLayers(): Layer[] {
  const out: Layer[] = []
  for (let i = 0; i < SLABS; i++) {
    const t = i / (SLABS - 1)
    out.push({
      width: 2.0 - t * 0.9,
      y: 0.86 + i * PITCH,
      x: Math.sin(i * 0.9 + 1.3) * 0.055,
      z: Math.cos(i * 1.4 + 0.6) * 0.055,
      yaw: i * 0.055 + 0.015,
    })
  }
  return out
}

function InnerDataCore() {
  const core = useRef<THREE.Mesh>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const housingRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const lime = Math.min(1, Math.max(0, (scrollBus.progress - 0.05) / 0.3))
    if (core.current) {
      core.current.scale.setScalar(1 + Math.sin(t * 1.7) * 0.22)
      ;(core.current.material as THREE.MeshBasicMaterial).opacity = lime * 0.8
    }
    if (ringA.current) {
      ringA.current.rotation.z += 0.0035
      ;(ringA.current.material as THREE.MeshBasicMaterial).opacity = lime * 0.55
    }
    if (ringB.current) {
      ringB.current.rotation.y += 0.0044
      ;(ringB.current.material as THREE.MeshBasicMaterial).opacity = lime * 0.3
    }
    if (housingRef.current) {
      ;(housingRef.current.material as THREE.MeshPhysicalMaterial).opacity = lime * 0.18
    }
  })

  return (
    <group position={[0, 4.32, 0]}>
      <RoundedBox ref={housingRef} args={[0.66, 0.66, 0.66]} radius={0.06} smoothness={2}>
        <meshPhysicalMaterial
          color="#e8ece6"
          transparent
          opacity={0}
          roughness={0.08}
          metalness={0}
          envMapIntensity={1.4}
          depthWrite={false}
        />
      </RoundedBox>
      <mesh ref={core}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshBasicMaterial color="#c8ff3d" transparent opacity={0} />
      </mesh>
      <mesh ref={ringA} rotation-x={0.9}>
        <torusGeometry args={[0.24, 0.007, 8, 48]} />
        <meshBasicMaterial color="#c8ff3d" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ringB} rotation-x={1.35}>
        <torusGeometry args={[0.32, 0.004, 8, 48]} />
        <meshBasicMaterial color="#c8ff3d" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function GrowthPillar() {
  const { mobile } = deviceBus
  const layers = useMemo(() => buildLayers(), [])
  const origin = useRef<THREE.Group>(null)
  const beaconRefs = useRef<(THREE.Mesh | null)[]>([])
  const tipRef = useRef<THREE.Mesh>(null)
  const limeRef = useRef(0)
  const accentRefs = useRef<THREE.Mesh[]>([])
  const accentTargetOps = useRef<number[]>([])

  const towerGeometry = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    layers.forEach((l, i) => {
      if (i >= SLABS - 2) return
      const g = new RoundedBoxGeometry(l.width, 0.46, l.width, 2, 0.05)
      g.rotateY(l.yaw)
      g.translate(l.x, l.y, l.z)
      parts.push(g)
    })
    return mergeGeometries(parts)!
  }, [layers])

  const capGeometry = useMemo(() => {
    const caps: THREE.BufferGeometry[] = []
    layers.slice(SLABS - 2).forEach((l) => {
      const g = new RoundedBoxGeometry(l.width, 0.46, l.width, 2, 0.05)
      g.rotateY(l.yaw)
      g.translate(l.x, l.y, l.z)
      caps.push(g)
    })
    return mergeGeometries(caps)!
  }, [layers])

  const graphite = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#16191a',
        metalness: 0.72,
        roughness: 0.32,
        envMapIntensity: 0.62,
      }),
    [],
  )

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#dfe4de',
        transparent: true,
        opacity: 0.32,
        roughness: 0.08,
        metalness: 0.05,
        envMapIntensity: 1.2,
        depthWrite: false,
      }),
    [],
  )

const nodes = useMemo(() => {
    const arr: { pos: [number, number, number]; beacon: boolean }[] = []
    layers.forEach((l, i) => {
      if (i === 0 || i >= SLABS - 2) return
      const edge = l.width / 2 - 0.1
      const signs: [number, number][] =
        i % 2 === 0
          ? [[1, 1], [-1, -1]]
          : [[-1, 1], [1, -1]]
      signs.forEach(([sx, sz], k) => {
        const beacon = i === 1 || i === 3 || i === 5
        arr.push({
          pos: [l.x + sx * edge * 0.82, l.y + 0.27, l.z + sz * edge * 0.9],
          beacon: beacon && k === 0,
        })
      })
    })
    return arr
  }, [layers])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    const lime = Math.min(1, Math.max(0, (scrollBus.progress - 0.05) / 0.3))
    limeRef.current += (lime - limeRef.current) * 0.08
    const l = limeRef.current

    ringMat.opacity = l * 0.55
    nodeMat.opacity = l * 0.7

    const p = scrollBus.intro
    if (origin.current) {
      const settle = Math.pow(1 - p, 2)
      origin.current.position.y = settle * 0.9 + Math.sin(t * 0.4) * 0.012 * p + (1 - p) * -0.35
      origin.current.scale.setScalar(1.04 - p * 0.04)
      const reveal = smoothstep(0.05, 0.32, scrollBus.progress) * (mobile ? 0.9 : 1.5)
      origin.current.rotation.y = reveal + Math.sin(t * 0.16) * 0.015 * p
    }

    beaconRefs.current.forEach((b, i) => {
      if (b) b.scale.setScalar(1 + Math.sin(t * 1.6 + i * 1.9) * 0.35 * l)
    })
    if (tipRef.current) tipRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.3 * l)

    accentRefs.current.forEach((m, i) => {
      if (m) {
        const mat = m.material as THREE.MeshBasicMaterial
        mat.opacity = l * accentTargetOps.current[i]
      }
    })
  })

  let beaconSlot = 0
  let accentSlot = 0

  const setAccentRef = (el: THREE.Mesh | null, targetOpacity: number) => {
    if (el) {
      accentTargetOps.current[accentSlot] = targetOpacity
      accentRefs.current[accentSlot++] = el
    }
  }

  return (
    <group ref={origin}>
      <RoundedBox args={[4.4, 0.34, 4.4]} radius={0.07} smoothness={2} position={[0, 0.17, 0]}>
        <meshStandardMaterial color="#0f1111" metalness={0.6} roughness={0.5} envMapIntensity={0.5} />
      </RoundedBox>
      <RoundedBox args={[3.5, 0.44, 3.5]} radius={0.08} smoothness={2} position={[0, 0.56, 0]}>
        <meshStandardMaterial color="#121414" metalness={0.64} roughness={0.45} envMapIntensity={0.5} />
      </RoundedBox>

      <mesh geometry={towerGeometry} material={graphite} castShadow={!mobile} />
      <mesh geometry={capGeometry} material={glassMat} />

      {layers.map((l, i) => (
        <RoundedBox
          key={`ring-${i}`}
          args={[l.width + 0.012, 0.016, l.width + 0.012]}
          radius={0.006}
          smoothness={2}
          position={[l.x, l.y + 0.27, l.z]}
          rotation-y={l.yaw}
          material={ringMat}
        />
      ))}

      {nodes.map((n, i) => {
        const isBeacon = n.beacon
        const slot = isBeacon ? beaconSlot++ : -1
        return (
          <RoundedBox
            key={`node-${i}`}
            args={[0.055, 0.055, 0.055]}
            radius={0.012}
            smoothness={2}
            position={n.pos}
            material={nodeMat}
            ref={isBeacon ? (el: THREE.Mesh | null) => { beaconRefs.current[slot] = el } : undefined}
          />
        )
      })}

      <mesh ref={(el) => { if (el) setAccentRef(el, 0.6) }} position={[0, 5.07, 0]}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshBasicMaterial color="#c8ff3d" transparent opacity={0} />
      </mesh>

      <InnerDataCore />
    </group>
  )
}
