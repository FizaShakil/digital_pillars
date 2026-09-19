/**
 * GPU capability probe — runs on cheap raw WebGL *before* the three.js chunk is
 * ever requested.
 *
 * Lighthouse and low-end devices revealed that the cost that matters is not the
 * render loop (already demand-driven) but evaluating the ~914 kB three.js
 * bundle at all. So we decide whether the cinematic layer is worthwhile up
 * front: a real GPU compiles a tiny synthetic workload in a few milliseconds,
 * while software rasterizers (SwiftShader / llvmpipe), headless harnesses and
 * GPU-less machines take far longer — for those the static layer is both the
 * better experience and the "clean fallback for older browsers" the brief asks
 * for.
 *
 * The probe draws a small (320x180) quad with a moderately expensive fragment
 * shader, measures the best of three finished frames, and discards the context.
 * Cost on a capable GPU: ~5-20 ms, once.
 */

export type GpuTier = 'ok' | 'weak' | 'unavailable'

/* A frame the synthetic workload may take before the device is considered
   unable to sustain the scene's 60fps target. Generous enough that integrated
   GPUs (Intel UHD/Iris, Apple, Adreno, Mali) pass; software rasterizers do not. */
const FRAME_BUDGET_MS = 38
const SAMPLES = 3
const WARMUP = 1

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 r;
uniform float t;
void main() {
  vec2 v = gl_FragCoord.xy / r;
  float a = 0.0;
  for (int i = 0; i < 44; i++) {
    float fi = float(i);
    a += sin(v.x * fi + t) * cos(v.y * fi - t) * 0.5;
    v = fract(v * 1.02 + 0.003);
  }
  gl_FragColor = vec4(a * 0.05, a * 0.08, a * 0.04, 1.0);
}
`

let cachedTier: GpuTier | null = null

/** Cached, single-shot GPU tier (probe runs at most once per page load). */
export function gpuTier(): GpuTier {
  if (cachedTier) return cachedTier
  cachedTier = runProbe()
  return cachedTier
}

function runProbe(): GpuTier {
  if (typeof document === 'undefined') return 'ok'
  let gl: WebGLRenderingContext | null = null
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 180
    const opts: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    }
    gl =
      (canvas.getContext('webgl2', opts) as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl', opts) as WebGLRenderingContext | null)
    // A driver that refuses a context (or flags a major caveat) cannot run the scene.
    if (!gl) return 'unavailable'

    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const name = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || gl.getParameter(gl.RENDERER))
      : ''
    if (/swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i.test(name)) {
      return 'weak'
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return 'ok' // shader refused: assume real but limited, let runtime probe decide
    const prog = gl.createProgram()
    if (!prog) return 'ok'
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return 'ok'
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uR = gl.getUniformLocation(prog, 'r')
    const uT = gl.getUniformLocation(prog, 't')
    gl.uniform2f(uR, canvas.width, canvas.height)
    gl.viewport(0, 0, canvas.width, canvas.height)

    const probe = new Uint8Array(4)
    const draw = (t: number) => {
      gl!.uniform1f(uT, t)
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
      // readPixels forces the pipeline to flush so the timing covers real GPU
      // work — gl.finish() alone is a no-op under Chromium's command buffer.
      gl!.readPixels(0, 0, 1, 1, gl!.RGBA, gl!.UNSIGNED_BYTE, probe)
    }

    let best = Infinity
    for (let i = 0; i < WARMUP + SAMPLES; i++) {
      const start = performance.now()
      draw(i * 0.7)
      const ms = performance.now() - start
      // First finished frame on a software rasterizer is already far over
      // budget — stop immediately instead of burning a second of main thread.
      if (i === 0 && ms > FRAME_BUDGET_MS * 4) return 'weak'
      if (i >= WARMUP) best = Math.min(best, ms)
    }

    console.info(`[gpu-probe] renderer="${name}" best=${best.toFixed(2)}ms tier=${best <= FRAME_BUDGET_MS ? 'ok' : 'weak'}`)
    return best <= FRAME_BUDGET_MS ? 'ok' : 'weak'
  } catch {
    return 'ok'
  } finally {
    try {
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      /* ignore */
    }
  }
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null
}