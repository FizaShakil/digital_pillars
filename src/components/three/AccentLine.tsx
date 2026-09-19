import { useMemo } from 'react'
import * as THREE from 'three'

type Point3 = [number, number, number]

/**
 * Ultra-light accent line (plain WebGL `THREE.Line`) used everywhere a thin
 * emissive stroke is needed. Avoids drei's `Line` component, which pulls in
 * the heavy Line2/three-stdlib stack purely to gain round-tipped fat lines.
 * One geometry per unique point array — module constants stay stable, so the
 * memo hits on every mount.
 */
export function AccentLine({
  points,
  color = '#c8ff3d',
  opacity = 0.45,
}: {
  points: Point3[]
  color?: string
  opacity?: number
}) {
  const geometry = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p))),
    [points],
  )

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </line>
  )
}