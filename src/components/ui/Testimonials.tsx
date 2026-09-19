import { useEffect, useState } from 'react'
import { TESTIMONIALS } from '../../content/data'
import { useHoverDevice, usePrefersReducedMotion } from '../../lib/browser'

/**
 * Testimonials as a layered glass stack — one voice forward, two behind it,
 * in the same "growth in layers" language as the pillar. Not a review grid.
 */
export function Testimonials() {
  const [index, setIndex] = useState(0)
  const hover = useHoverDevice()
  const reduced = usePrefersReducedMotion()
  const count = TESTIMONIALS.length

  useEffect(() => {
    // auto-rotate only where the machine is visible and motion is allowed
    if (reduced || !hover) return
    const id = window.setInterval(() => setIndex((v) => (v + 1) % count), 6500)
    return () => window.clearInterval(id)
  }, [reduced, hover, count])

  const prev = () => setIndex((v) => (v - 1 + count) % count)
  const next = () => setIndex((v) => (v + 1) % count)

  return (
    <section id="studio" className="pointer-events-auto relative z-10 scroll-mt-24">
      <div className="mx-auto max-w-[1440px] px-5 py-[16vh] sm:px-8 sm:py-[18vh]">
        <div className="flex items-end justify-between gap-6" data-reveal="right">
          <div>
            <p className="label" data-parallax data-depth="0.08">02 — Studio voice</p>
            <h2
              className="display mt-5 text-bone"
              style={{ fontSize: 'clamp(2.2rem, 5.6vw, 4.6rem)' }}
            >
              Proof, layered.
            </h2>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="grid size-11 place-items-center rounded-full border border-bone/15 transition-colors duration-300 hover:border-lime/60"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M12 2 2 12M2 12h8M2 12V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="grid size-11 place-items-center rounded-full border border-bone/15 transition-colors duration-300 hover:border-lime/60"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 12 12 2M12 2H4M12 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* the stack */}
        <div className="relative mt-12 h-[460px] sm:h-[400px]" data-reveal="pop">
          {TESTIMONIALS.map((t, k) => {
            const active = k === index
            const behind = (k - index + count) % count
            return (
              <figure
                key={t.name}
                aria-hidden={!active}
                className="glass absolute inset-0 m-auto flex max-w-3xl flex-col justify-between p-7 sm:p-10"
                style={{
                  zIndex: active ? 10 : 10 - behind,
                  opacity: active ? 1 : behind === 1 ? 0.42 : 0.2,
                  transform: active
                    ? 'translateY(0) rotateX(0) scale(1)'
                    : `translateY(${behind === 1 ? '18px' : '34px'}) rotateX(${behind === 1 ? '-3deg' : '-6deg'}) scale(${behind === 1 ? 0.97 : 0.94})`,
                  transition: 'transform 0.9s cubic-bezier(0.19,1,0.22,1), opacity 0.6s ease',
                  pointerEvents: active ? 'auto' : 'none',
                }}
              >
                <div>
                  <span className="pulse-dot" aria-hidden="true" />
                  <blockquote
                    className="mt-5 text-[clamp(1.05rem,2.4vw,1.55rem)] font-light leading-snug tracking-tight text-bone/95"
                  >
                    “{t.quote}”
                  </blockquote>
                </div>
                <figcaption className="mt-8 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-medium text-bone">{t.name}</p>
                    <p className="mt-0.5 text-[12px] text-ash">{t.role}</p>
                  </div>
                  <p className="label !text-lime">{t.metric}</p>
                </figcaption>
              </figure>
            )
          })}
        </div>

        {/* progress seeds */}
        <div className="mt-8 flex items-center gap-2 md:hidden">
          {TESTIMONIALS.map((t, k) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setIndex(k)}
              aria-label={`Testimonial ${k + 1}`}
              className={`h-1 rounded-full transition-all duration-500 ${
                k === index ? 'w-8 bg-lime' : 'w-4 bg-bone/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}