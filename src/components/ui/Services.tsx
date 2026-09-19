import { useEffect, useRef, useState } from 'react'
import { EMAIL, SERVICES } from '../../content/data'
import type { Service } from '../../content/types'
import { scrollToTarget } from '../../lib/smooth'

/**
 * The four pillars are real navigable destinations. Each service owns a
 * persistent, deep-linkable section with a stable id (`#paid-social`,
 * `#social-presence`, `#digital-experiences`, `#consulting`) — so a shared
 * link, a refresh or browser back/forward always lands on that pillar's own
 * content, heading and action. The list on the left mirrors whichever
 * destination is in view.
 */
export function ServicesSection() {
  const [active, setActive] = useState<Service>(SERVICES[0])
  const panelRefs = useRef<Record<string, HTMLElement | null>>({})

  // deep-link + browser history support (hash is honoured on first paint)
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace('#', '')
      const found = SERVICES.find((s) => s.id === h)
      if (found) {
        setActive(found)
        requestAnimationFrame(() => scrollToTarget(`#${found.id}`, -24))
      }
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [])

  // keep the list highlight in sync with whichever pillar is on screen
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const id = entry.target.id
          const found = SERVICES.find((s) => s.id === id)
          if (found) setActive(found)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    Object.values(panelRefs.current).forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const go = (svc: Service) => {
    setActive(svc)
    history.replaceState(null, '', `#${svc.id}`)
    scrollToTarget(`#${svc.id}`, -24)
  }

  return (
    <section id="services" className="pointer-events-auto relative z-10 scroll-mt-24">
      <div className="mx-auto max-w-[1440px] px-5 pb-6 pt-[18vh] sm:px-8" data-reveal="left">
        <p className="label" data-parallax data-depth="0.08">01 — What we build</p>
        <h2
          className="display mt-5 text-bone"
          style={{ fontSize: 'clamp(2.2rem, 5.6vw, 4.6rem)' }}
        >
          Four pillars of growth.
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ash">
          Each engagement is engineered in layers — systems first, creative on top, then
          measurement beneath everything.
        </p>
      </div>

      <ol className="mx-auto max-w-[1440px] px-5 sm:px-8">
        {SERVICES.map((svc) => {
          const isActive = active.id === svc.id
          return (
            <li key={svc.id} data-reveal="up">
              <a
                href={`#${svc.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  go(svc)
                }}
                aria-current={isActive ? 'true' : undefined}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-t border-bone/10 py-7 sm:gap-8 sm:py-9"
              >
                <span
                  className={`mono tab text-sm transition-colors duration-300 sm:text-base ${
                    isActive ? 'text-lime' : 'text-ash group-hover:text-lime'
                  }`}
                >
                  /{svc.index}
                </span>
                <span className="min-w-0">
                  <span
                    className="display block text-bone transition-transform duration-300 group-hover:translate-x-2"
                    style={{ fontSize: 'clamp(1.5rem, 3.6vw, 3rem)' }}
                  >
                    {svc.title}
                  </span>
                  <span className="mt-1 hidden text-[13px] text-ash lg:block">{svc.blurb}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="hidden text-[11px] uppercase tracking-[0.2em] text-ash sm:block">
                    Explore
                  </span>
                  <span className="grid size-11 place-items-center rounded-full border border-bone/15 transition-colors duration-300 group-hover:border-lime/60">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 12 12 2M12 2H4M12 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-bone transition-colors duration-300 group-hover:text-lime" />
                    </svg>
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ol>

      {/* one persistent, deep-linkable destination per pillar */}
      <div
        data-service-target
        className="mx-auto mt-[4vh] max-w-[1440px] space-y-6 px-5 pb-[16vh] sm:px-8"
      >
        {SERVICES.map((svc, i) => (
          <article
            key={svc.id}
            id={svc.id}
            ref={(el) => {
              panelRefs.current[svc.id] = el
            }}
            aria-labelledby={`${svc.id}-title`}
            data-reveal="pop"
            className="glass glass-scene scroll-mt-28 overflow-hidden"
          >
            <div className="relative grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-center">
              {/* oversized ghost numeral gives every pillar its own signature */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-6 select-none font-mono text-[7rem] leading-none tracking-tighter text-bone/[0.04] sm:text-[10rem]"
              >
                {svc.index}
              </span>

              <div className={`relative min-w-0 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <p className="label !text-lime">/{svc.index} — Pillar {svc.index}</p>
                <h3
                  id={`${svc.id}-title`}
                  className="display mt-4 text-bone"
                  style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)' }}
                >
                  {svc.title}
                </h3>
                <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ash">{svc.blurb}</p>
                <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-bone/80">{svc.detail}</p>

                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {svc.scope.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-bone/12 bg-bone/[0.03] px-3.5 py-1.5 text-[11px] tracking-wide text-bone/80"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={`relative flex flex-col gap-6 lg:w-[230px] ${
                  i % 2 === 1 ? 'lg:order-1 lg:items-start' : 'lg:items-end'
                }`}
              >
                <div className="w-full max-w-[230px] border-l border-lime/30 pl-4 text-left">
                  <p className="display tab text-[34px] leading-none text-bone">{svc.signal.value}</p>
                  <p className="mt-1.5 text-[11px] leading-snug text-ash">{svc.signal.label}</p>
                </div>
                <a
                  href={`mailto:${EMAIL}?subject=Start%20a%20project%20—%20${encodeURIComponent(svc.title)}`}
                  className="btn btn-lime !px-6 !py-3.5 text-[12px]"
                >
                  Start this pillar
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
