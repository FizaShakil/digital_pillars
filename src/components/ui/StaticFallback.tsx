/**
 * Static fallback — used only when WebGL is unavailable.
 * A pure CSS architectural backdrop (layered "pillar" + restrained glow +
 * hairline grid) keeps the identity coherent without any GPU work.
 */
export function StaticFallback() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* hairline floor grid */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(141,148,145,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(141,148,145,0.35) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 58% 42%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 58% 42%, black, transparent 75%)',
        }}
      />
      {/* restrained glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 34% 46% at 58% 32%, rgba(200,255,61,0.1), transparent 70%)',
        }}
      />
      {/* the layered pillar */}
      <div className="absolute left-1/2 top-[6%] h-[88vh] w-[230px] -translate-x-1/2">
        <CSSPillar />
      </div>
    </div>
  )
}

function CSSPillar() {
  const layers = [230, 218, 206, 194, 182, 172, 164, 158]
  return (
    <div className="flex h-full items-end justify-center">
      <div className="relative w-full">
        {/* plinths */}
        <div className="mx-auto mb-4 h-5 w-full rounded-[14px] border border-bone/10 bg-[#0d0f0f]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
        <div className="mx-auto mb-3 h-6 w-[88%] rounded-[12px] border border-bone/10 bg-[#101313]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
        {/* tower */}
        {layers.map((w, i) => (
          <div
            key={i}
            className="mx-auto mb-2 rounded-[10px] bg-[#151818]"
            style={{
              width: w,
              height: 30,
              opacity: 1 - i * 0.015,
              transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)`,
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 22px -14px rgba(0,0,0,0.8)',
              border: '1px solid rgba(242,242,237,0.07)',
            }}
          />
        ))}
      </div>
    </div>
  )
}