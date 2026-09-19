import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { EMAIL, FAQS } from '../../content/data'
import { usePrefersReducedMotion } from '../../lib/browser'
import { getLenis } from '../../lib/smooth'

/**
 * ASK PILLARS — a quiet glass FAQ, not a chatbot.
 * Fixed control in the corner; preset questions reveal concise predefined answers.
 */
export function AskPillars() {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const reduced = usePrefersReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)

  // lock page scroll while the panel is open (panel itself is scrollable)
  useEffect(() => {
    const lenis = getLenis()
    if (open) lenis?.stop()
    else lenis?.start()
    return () => lenis?.start()
  }, [open])

  // entrance micro-animation
  useEffect(() => {
    if (!open || reduced) return
    const el = panelRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 18, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' },
    )
  }, [open, reduced])

  const toggle = (id: string) => setActiveId((v) => (v === id ? null : id))

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-4 sm:bottom-6 sm:right-6">
      {open && (
        <div
          ref={panelRef}
          data-lenis-prevent
          className="glass w-[calc(100vw-2.5rem)] max-w-[360px] overflow-hidden"
          role="dialog"
          aria-label="Ask Pillars — quick answers"
        >
          <div className="flex items-center justify-between border-b border-bone/10 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="pulse-dot" aria-hidden="true" />
              <span className="label !text-[10px]">Ask Pillars</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close panel"
              className="grid size-8 place-items-center rounded-full border border-bone/12 text-ash transition-colors duration-300 hover:border-bone/40 hover:text-bone"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path d="m1 1 9 9M10 1l-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <p className="px-5 pt-4 text-[12px] leading-relaxed text-ash">
            Quick answers from the studio team. No chat scripts — just the short version.
          </p>

          <div className="max-h-[52vh] overflow-y-auto px-5 pb-5 pt-1">
            {FAQS.map((f) => {
              const openQ = activeId === f.id
              return (
                <div key={f.id} className="border-b border-bone/8 last:border-0">
                  <button
                    type="button"
                    onClick={() => toggle(f.id)}
                    aria-expanded={openQ}
                    className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-[13px] text-bone/90 transition-colors duration-300 hover:text-bone"
                  >
                    {f.question}
                    <span
                      className={`shrink-0 text-lime transition-transform duration-300 ${
                        openQ ? 'rotate-45' : ''
                      }`}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-400 ${
                      openQ ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden pb-4 text-[12px] leading-relaxed text-ash">
                      {f.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-bone/10 px-5 py-3.5">
            <p className="label !text-[10px]">
              Still curious?{' '}
              <a href={`mailto:${EMAIL}`} className="text-bone/80 transition-colors hover:text-lime">
                {EMAIL}
              </a>
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="btn btn-lime flex items-center gap-2.5 !py-3 !pl-4 !pr-5 text-[12px]"
      >
        <span className="pulse-dot" aria-hidden="true" />
        Ask Pillars
      </button>
    </div>
  )
}