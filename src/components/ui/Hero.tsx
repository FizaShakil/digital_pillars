import { HERO_LINES, HERO_SCROLL_HINT, HERO_SUPPORT, METRIC_CARDS } from '../../content/data'
import type { CardZone } from '../../content/types'
import { scrollToTarget } from '../../lib/smooth'
import { useMagnetic } from '../../lib/ux'
import { GlassCard } from './GlassCard'

const ZONES: Record<CardZone, string> = {
  tr: 'absolute right-[3%] top-[11%] sm:right-[4%] sm:top-[13%]',
  mr: 'absolute right-[4%] top-[40%] hidden md:block lg:top-[43%]',
  ml: 'absolute left-[46%] top-[26%] hidden xl:block',
  bl: 'absolute bottom-[16%] right-[3%] sm:bottom-[9%] sm:right-[4%]',
}

export function Hero() {
  return (
    <section id="hero" className="relative z-10 min-h-[100svh]">
      <div data-hero-exit className="relative mx-auto h-[100svh] max-w-[1440px] px-3">
        {/* eyebrow */}
        <div className="absolute left-5 top-[12%] sm:left-8 sm:top-[14%]">
          <span className="h-px w-8 bg-lime/60" aria-hidden="true" />
          <p className="label mt-3">Growth, built in layers</p>
        </div>

        {/* primary type */}
        <h1
          aria-label={`${HERO_LINES.map((l) => l.text).join(' ')}`}
          className="display absolute left-5 top-[17%] max-w-[13ch] text-bone sm:left-8 sm:top-[19%]"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 8rem)' }}
        >
          {HERO_LINES.map((line) => (
            <span key={line.text} className="hero-line">
              <span
                data-hero-line
                className={
                  line.emphasis === 'lime'
                    ? 'text-lime'
                    : line.emphasis === 'outline'
                      ? 'text-stroke'
                      : 'text-bone'
                }
              >
                {line.text}
              </span>
            </span>
          ))}
        </h1>

        {/* supporting copy */}
        <p
          data-hero-support
          data-parallax
          data-depth="0.1"
          className="absolute left-5 top-[52%] max-w-sm text-[14px] leading-relaxed text-ash sm:left-8 sm:top-[54%] lg:top-[54%]"
        >
          {HERO_SUPPORT}
        </p>

        {/* primary CTA — arrives last */}
        <div data-hero-cta className="absolute bottom-[12%] left-5 sm:bottom-[9%] sm:left-8">
          <HeroCta />
        </div>

        {/* scroll hint */}
        <div
          data-hero-support
          data-parallax
          data-depth="0.06"
          className="absolute bottom-[9%] right-[18%] hidden items-center gap-3 md:flex"
        >
          <span className="h-px w-10 bg-white/20" aria-hidden="true" />
          <span className="label">{HERO_SCROLL_HINT}</span>
        </div>

        {/* floating glass metric cards */}
        {METRIC_CARDS.map((card, i) => (
          <GlassCard
            key={card.id}
            card={card}
            className={ZONES[card.zone]}
            floatDelay={2.7 + i * 0.4}
          />
        ))}
      </div>
    </section>
  )
}

function HeroCta() {
  const ref = useMagnetic<HTMLAnchorElement>()
  return (
    <a
      ref={ref}
      href="#contact"
      onClick={(e) => {
        e.preventDefault()
        scrollToTarget('#contact', -4)
      }}
      className="btn btn-lime !px-7 !py-4 text-[13px]"
    >
      Start a project
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 12 12 2M12 2H4M12 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}