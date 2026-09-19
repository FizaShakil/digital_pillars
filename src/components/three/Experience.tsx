import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { deviceBus, scrollBus } from '../../lib/bus'
import { CameraRig } from './CameraRig'
import { FloorGrid } from './FloorGrid'
import { GlassAnchors } from './GlassAnchors'
import { GrowthPillar } from './GrowthPillar'
import { ParticleField } from './ParticleField'
import { PerformanceEnvironment } from './PerformanceEnvironment'
import { SecondaryStructures } from './SecondaryStructures'

/**
 * The architectural composition: pillar, secondary monoliths, particles,
 * floor and camera. Also owns the intro clock (bus.intro) that the rest of
 * the scene and the DOM entrance read from.
 *
 * Readiness is owned by the single `PacedLoop` in SceneCanvas (which also
 * drives the frame loop) — this component only mounts the visuals.
 */
export default function Experience() {
  useEffect(() => {
    if (deviceBus.reduced) {
      scrollBus.intro = 1
      scrollBus.entered = true
    }
  }, [])

  // eased intro clock — the whole composition shares this single timeline
  useFrame((_, dt) => {
    if (deviceBus.reduced) return
    scrollBus.intro = Math.min(1, scrollBus.intro + dt * 0.62)
    if (scrollBus.intro >= 1) scrollBus.entered = true
  })

  return (
    <>
      <PerformanceEnvironment />
      <FloorGrid />
      <GrowthPillar />
      <SecondaryStructures />
      <ParticleField />
      <GlassAnchors />
      <CameraRig />
    </>
  )
}