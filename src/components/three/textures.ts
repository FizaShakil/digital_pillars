import * as THREE from 'three'

/** Soft round sprite for particles (procedural — no external images). */
let particleSprite: THREE.Texture | null = null
export function getParticleSprite(): THREE.Texture {
  if (particleSprite) return particleSprite
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.5)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  particleSprite = new THREE.CanvasTexture(c)
  particleSprite.colorSpace = THREE.SRGBColorSpace
  return particleSprite
}

/** Subtle floor grid texture. */
let gridTexture: THREE.Texture | null = null
export function getGridTexture(): THREE.Texture {
  if (gridTexture) return gridTexture
  const size = 256
  const cell = 32
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(242,242,237,0.85)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= size; x += cell) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, size)
  }
  for (let y = 0; y <= size; y += cell) {
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
  }
  ctx.stroke()
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(24, 24)
  t.needsUpdate = true
  gridTexture = t
  return t
}

/**
 * Cheap procedural environment for mobile: a 64×32 equirectangular gradient
 * (bone sky → ink ground, with a restrained lime band at the horizon). Used
 * instead of the PMREM/`RoomEnvironment` bake on phones — that bake renders a
 * scene several times and is a real startup cost, while this is one texture.
 */
let envTexture: THREE.Texture | null = null
export function getEnvironmentTexture(): THREE.Texture {
  if (envTexture) return envTexture
  const w = 64
  const h = 32
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#6b7370')
  g.addColorStop(0.5, '#2a302f')
  g.addColorStop(0.52, '#1a2420')
  g.addColorStop(0.6, 'rgba(120,160,50,0.55)')
  g.addColorStop(0.68, '#0c0e0d')
  g.addColorStop(1, '#070808')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  // a soft lime highlight so the graphite still catches a coloured reflection
  const spot = ctx.createRadialGradient(18, 14, 0, 18, 14, 16)
  spot.addColorStop(0, 'rgba(200,255,61,0.55)')
  spot.addColorStop(1, 'rgba(200,255,61,0)')
  ctx.fillStyle = spot
  ctx.fillRect(0, 0, w, h)
  const t = new THREE.CanvasTexture(c)
  t.mapping = THREE.EquirectangularReflectionMapping
  t.colorSpace = THREE.SRGBColorSpace
  envTexture = t
  return t
}

/** Soft radial glow for grounding the base. */
let glowTexture: THREE.Texture | null = null
export function getGlowTexture(): THREE.Texture {
  if (glowTexture) return glowTexture
  const size = 256
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(200,255,61,0.9)')
  g.addColorStop(0.35, 'rgba(200,255,61,0.28)')
  g.addColorStop(1, 'rgba(200,255,61,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  glowTexture = new THREE.CanvasTexture(c)
  glowTexture.colorSpace = THREE.SRGBColorSpace
  return glowTexture
}