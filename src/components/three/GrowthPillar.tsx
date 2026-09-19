import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { deviceBus, scrollBus, smoothstep } from '../../lib/bus'
import { AccentLine } from './AccentLine'
import { getGlowTexture } from './textures'

type Floor = { w: number; d: number; y: number; dx: number; dz: number }

const SLABS = 9
const PITCH = 0.48
const BASE_Y = 0.92
const PLATE_T = 0.13
const FW = 1.6
const FD = 1.24
const COL = 0.13
const COL_BOTTOM = 0.65
const COL_TOP = BASE_Y + (SLABS - 1) * PITCH + 0.22
const CROWN_Y = BASE_Y + (SLABS - 1) * PITCH + 0.32

const WIDTHS = [3.0, 2.95, 2.7, 2.45, 2.2, 2.0, 1.75, 1.5, 1.25]

function buildFloors(): Floor[] {
  return WIDTHS.map((w, i) => ({
    w,
    d: w * 0.78,
    y: BASE_Y + i * PITCH,
    dx: Math.sin(i * 1.1 + 0.7) * 0.015,
    dz: Math.cos(i * 1.3 + 0.4) * 0.015,
  }))
}

function InnerDataCore() {
  const core = useRef<THREE.Mesh>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (deviceBus.reduced) return
    const t = state.clock.elapsedTime
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 1.7) * 0.22)
    if (ringA.current) ringA.current.rotation.z += 0.0035
    if (ringB.current) ringB.current.rotation.y += 0.0044
  })

  return (
    <group>
      <mesh ref={core}>
        <octahedronGeometry args={[0.17, 0]} />
        <meshBasicMaterial color="#c8ff3d" />
      </mesh>
      <mesh ref={ringA} rotation-x={0.9}>
        <torusGeometry args={[0.28, 0.009, 8, 48]} />
        <meshBasicMaterial color="#c8ff3d" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ringB} rotation-x={1.35}>
        <torusGeometry args={[0.37, 0.005, 8, 48]} />
        <meshBasicMaterial color="#c8ff3d" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function GrowthPillar() {
  const { mobile, reduced } = deviceBus
  const floors = useMemo(() => buildFloors(), [])
  const origin = useRef<THREE.Group>(null)
  const beaconRefs = useRef<(THREE.Mesh | null)[]>([])
  const tipRef = useRef<THREE.Mesh>(null)

  const shellMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#151819',
        metalness: 0.88,
        roughness: 0.28,
        envMapIntensity: 0.9,
      }),
    [],
  )
  const frameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e2325',
        metalness: 0.94,
        roughness: 0.2,
        envMapIntensity: 1.0,
      }),
    [],
  )
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#c8d4cb',
        transparent: true,
        opacity: 0.18,
        roughness: 0.04,
        metalness: 0.18,
        envMapIntensity: 1.6,
        depthWrite: false,
      }),
    [],
  )
  const coreMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#c8ff3d',
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )
  const nodeMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#c8ff3d', transparent: true, opacity: 0.7 }),
    [],
  )

  const shellGeo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    const push = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const g = new THREE.BoxGeometry(w, h, d)
      g.translate(x, y, z)
      parts.push(g)
    }
    push(4.2, 0.36, 3.5, 0, 0.18, 0)
    push(3.5, 0.44, 2.9, 0, 0.58, 0)
    floors.forEach((f) => {
      push(f.w, PLATE_T, f.d, f.dx, f.y, f.dz)
      push(f.w + 0.06, 0.028, f.d + 0.06, f.dx, f.y + PLATE_T / 2 + 0.014, f.dz)
    })
    push(1.2, 0.14, 1.0, 0, CROWN_Y - 0.18, 0)
    return mergeGeometries(parts)!
  }, [floors])

  const frameGeo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    const push = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const g = new THREE.BoxGeometry(w, h, d)
      g.translate(x, y, z)
      parts.push(g)
    }
    const colH = COL_TOP - COL_BOTTOM
    const colY = (COL_TOP + COL_BOTTOM) / 2
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        push(COL, colH, COL, sx * FW, colY, sz * FD)
      }
    }
    floors.forEach((f) => {
      push(2 * FW + COL, 0.06, 0.12, 0, f.y, FD)
      push(2 * FW + COL, 0.06, 0.12, 0, f.y, -FD)
      push(0.12, 0.06, 2 * FD + COL, FW, f.y, 0)
      push(0.12, 0.06, 2 * FD + COL, -FW, f.y, 0)
    })
    return mergeGeometries(parts)!
  }, [floors])

  const glassGeo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (let i = 0; i < SLABS - 1; i++) {
      const w = Math.min(WIDTHS[i], WIDTHS[i + 1]) - 0.16
      const h = PITCH - PLATE_T
      const y = floors[i].y + PITCH / 2
      const g = new THREE.BoxGeometry(w, h, w * 0.78)
      g.translate(0, y, 0)
      parts.push(g)
    }
    const crown = new THREE.BoxGeometry(1.04, 0.48, 0.84)
    crown.translate(0, CROWN_Y + 0.06, 0)
    parts.push(crown)
    return mergeGeometries(parts)!
  }, [floors])

  const coreGeo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (let i = 0; i < SLABS - 1; i++) {
      const w = Math.min(WIDTHS[i], WIDTHS[i + 1]) - 0.4
      const h = (PITCH - PLATE_T) * 0.72
      const y = floors[i].y + PITCH / 2
      const g = new THREE.BoxGeometry(w, h, w * 0.78)
      g.translate(0, y, 0)
      parts.push(g)
    }
    return mergeGeometries(parts)!
  }, [floors])

  const nodes = useMemo(() => {
    const arr: { pos: [number, number, number]; beacon: boolean }[] = []
    floors.forEach((f, i) => {
      if (i === 0) return
      const sx = i % 2 === 0 ? 1 : -1
      const sz = i % 2 === 0 ? -1 : 1
      arr.push({
        pos: [sx * FW, f.y + 0.16, sz * FD],
        beacon: i === 1 || i === 3 || i === 5 || i === 7,
      })
    })
    return arr
  }, [floors])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (reduced) return

    const p = scrollBus.intro
    if (origin.current) {
      const settle = Math.pow(1 - p, 2)
      origin.current.position.y = settle * 0.9 + Math.sin(t * 0.4) * 0.012 * p + (1 - p) * -0.35
      origin.current.scale.setScalar(1.03 - p * 0.03)
      const reveal = smoothstep(0.05, 0.32, scrollBus.progress) * (mobile ? 0.9 : 1.5)
      origin.current.rotation.y = reveal + Math.sin(t * 0.16) * 0.015 * p
    }

    beaconRefs.current.forEach((b, i) => {
      if (b) b.scale.setScalar(1 + Math.sin(t * 1.6 + i * 1.9) * 0.35)
    })
    if (tipRef.current) tipRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.3)
  })

  let beaconSlot = 0

  return (
    <group ref={origin}>
      <mesh geometry={shellGeo} material={shellMat} castShadow={!mobile} receiveShadow={!mobile} />
      <mesh geometry={frameGeo} material={frameMat} castShadow={!mobile} />
      <mesh geometry={coreGeo} material={coreMat} />
      <mesh geometry={glassGeo} material={glassMat} />

      <AccentLine points={[[-FW + 0.05, 0.72, FD + 0.075], [-FW + 0.05, COL_TOP - 0.05, FD + 0.075]]} opacity={0.4} />
      <AccentLine points={[[FW - 0.05, 0.72, FD + 0.075], [FW - 0.05, COL_TOP - 0.05, FD + 0.075]]} opacity={0.4} />
      <AccentLine points={[[-FW - 0.075, 0.72, -FD], [-FW - 0.075, COL_TOP - 0.05, -FD]]} opacity={0.2} />
      <AccentLine points={[[FW + 0.075, 0.72, -FD], [FW + 0.075, COL_TOP - 0.05, -FD]]} opacity={0.2} />

      {nodes.map((n, i) => {
        const isBeacon = n.beacon
        const slot = isBeacon ? beaconSlot++ : -1
        return (
          <mesh
            key={`node-${i}`}
            position={n.pos}
            material={nodeMat}
            ref={isBeacon ? (el: THREE.Mesh | null) => { beaconRefs.current[slot] = el } : undefined}
          >
            <boxGeometry args={[0.07, 0.07, 0.07]} />
          </mesh>
        )
      })}

      <AccentLine points={[[0, CROWN_Y + 0.28, 0], [0, CROWN_Y + 0.62, 0]]} opacity={0.5} />
      <mesh ref={tipRef} position={[0, CROWN_Y + 0.64, 0]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshBasicMaterial color="#c8ff3d" />
      </mesh>

      <group position={[0, CROWN_Y + 0.06, 0]} scale={0.78}>
        <InnerDataCore />
      </group>

      <Billboard position={[0, 2.6, -4.0]}>
        <mesh renderOrder={-1}>
          <planeGeometry args={[12, 12]} />
          <meshBasicMaterial
            map={getGlowTexture()}
            color="#c8ff3d"
            transparent
            opacity={0.06}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Billboard>
    </group>
  )
}
