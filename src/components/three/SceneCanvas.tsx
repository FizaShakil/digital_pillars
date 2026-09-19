import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import Experience from './Experience'
import { PacedLoop } from './PacedLoop'
import { getEnvironmentTexture } from './textures'
import { deviceBus, sceneEvents } from '../../lib/bus'

/**
 * Lazy-loaded WebGL layer. Renderer tuned for battery-friendly quality:
 * capped DPR, no stencil, ACES tone mapping. The frame loop pauses when the
 * tab is hidden so nothing renders in the background.
 */
function SceneCanvas() {
  const [paused, setPaused] = useState(() => document.hidden)

  // Readiness / failure is decided by the frame-budget probe, not by mounting:
  // the scene instantly soft-fades in when it can hold budget and reports
  // failure (-> static fallback) when it cannot. In forced mode (`?scene=1`)
  // the probe is skipped and readiness is declared on a short beat.
  useEffect(() => {
    if (!deviceBus.forceScene) return
    const t = window.setTimeout(() => sceneEvents.setReady(true), 200)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const onVis = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      sceneEvents.setReady(false)
    }
  }, [])

  return (
    <Canvas
      // demand-mode: PacedLoop drives invalidations (60fps while active,
      // ~11fps idle, zero when the tab is hidden) — no permanent render loop.
      frameloop={paused ? 'never' : 'demand'}
      // Phones render at a tighter pixel budget — the probe can trim it again.
      dpr={deviceBus.mobile ? [1, 1.3] : [1, 2]}
      camera={{ fov: 42, near: 0.1, far: 60, position: [0, 2.05, 8.4] }}
      gl={{
        // MSAA is a real fill-rate cost — phones render without it, the probe
        // can lower resolution further, and the film grain hides aliasing.
        antialias: !deviceBus.mobile,
        alpha: true,
        stencil: false,
        depth: true,
        powerPreference: 'high-performance',
      }}
      // 'percentage' => PCFShadowMap (three 0.186 dropped PCFSoftShadowMap)
      shadows={!deviceBus.mobile && !deviceBus.reduced ? 'percentage' : false}
      style={{ pointerEvents: 'none' }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.06
        if (deviceBus.mobile) {
          // Profile-driven: skip the multi-pass PMREM/RoomEnvironment bake on
          // phones and use a single procedural equirect texture instead — same
          // graphite-with-lime reflection language, a fraction of the startup.
          scene.environment = getEnvironmentTexture()
          scene.environmentIntensity = 0.5
        } else {
          // procedural room environment -> graphite reflections without assets
          const pmrem = new THREE.PMREMGenerator(gl)
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
          scene.environmentIntensity = 0.55
          pmrem.dispose()
        }
      }}
    >
      <Suspense fallback={null}>
        <PacedLoop
          onProbe={
            deviceBus.forceScene
              ? undefined
              : (ok) => {
                  sceneEvents.setReady(ok)
                }
          }
        />
        <Experience />
      </Suspense>
    </Canvas>
  )
}

export default SceneCanvas