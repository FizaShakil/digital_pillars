import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import type { MetricCard } from '../../content/types'
import { usePrefersReducedMotion } from '../../lib/browser'
import { useTilt } from '../../lib/ux'

/**
 * Floating glass metric card — a real "live dashboard" widget:
 *  - the headline stat counts up to its value,
 *  - a miniature sparkline draws in,
 *  - three transform layers keep purposes separate (choreography / float / tilt).
 *
 * Reduced-motion users simply receive the settled stat and chart — no animation,
 * no hidden states.
 */

function fmt(card: MetricCard, v: number): string {
  const d = card.decimals ?? 0
  const opts: Intl.NumberFormatOptions = {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }
  const num = card.group ? v.toLocaleString('en-US', opts) : v.toFixed(d)
  return `${card.prefix ?? ''}${num}${card.suffix ?? ''}`
}

/** Polyline + closed area points for the sparkline, normalised to a 100×26 box. */
function sparkPath(values: number[]): { points: string; area: string } {
  const W = 100
  const H = 26
  const P = 3
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = P + (i / (values.length - 1)) * (W - P * 2)
    const y = H - P - ((v - min) / span) * (H - P * 2)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const points = pts.join(' ')
  const area = `${points} ${(W - P).toFixed(2)},${H} ${P},${H}`
  return { points, area }
}

export function GlassCard({
  card,
  className,
  floatDelay = 0,
}: {
  card: MetricCard
  className: string
  floatDelay?: number
}) {
  const { innerRef, onMove, onLeave } = useTilt<HTMLDivElement>()
  const reduced = usePrefersReducedMotion()
  const valueRef = useRef<HTMLSpanElement>(null)
  const lineRef = useRef<SVGPolylineElement>(null)
  const areaRef = useRef<SVGPolygonElement>(null)
  const [inView, setInView] = useState(typeof IntersectionObserver === 'undefined')

  // fire the live widgets once the card scrolls into view
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || inView) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    if (innerRef.current) io.observe(innerRef.current)
    return () => io.disconnect()
  }, [innerRef, inView])

  // count-up the headline stat
  useEffect(() => {
    if (!inView || reduced || card.countTo == null) return
    const el = valueRef.current
    if (!el) return
    el.textContent = fmt(card, 0)
    const obj = { v: 0 }
    const tw = gsap.to(obj, {
      v: card.countTo,
      duration: 1.7,
      ease: 'power2.out',
      delay: 0.35,
      onUpdate: () => {
        el.textContent = fmt(card, obj.v)
      },
    })
    return () => {
      tw.kill()
    }
  }, [inView, reduced, card])

  // draw the sparkline in, softly fading the area fill up underneath
  useEffect(() => {
    if (!inView || reduced || !card.spark) return
    const line = lineRef.current
    const area = areaRef.current
    if (!line || !area) return
    const tl = gsap.timeline({ delay: 0.6 })
    tl.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
    tl.fromTo(area, { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.35)
    return () => {
      tl.kill()
    }
  }, [inView, reduced, card.spark])

  const path = useMemo(() => (card.spark ? sparkPath(card.spark) : null), [card.spark])
  const gradId = `sg-${card.id}`

  return (
    <div data-hero-card className={className}>
      <div className="card-float will-change-transform" style={{ animationDelay: `${floatDelay}s` }}>
        <div
          ref={innerRef}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="glass glass-scene pointer-events-auto min-w-[176px] px-5 py-4 will-change-transform"
        >
          <div className="flex items-center gap-2.5">
            <span className="pulse-dot" aria-hidden="true" />
            <span className="label !text-[10px]">{card.label}</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2.5">
            <span ref={valueRef} className="display tab leading-none text-[30px] text-bone">
              {card.value}
            </span>
            {card.delta && (
              <span className="tab text-[12px] font-medium text-lime">{card.delta}</span>
            )}
          </div>

          {card.spark && path && (
            <svg
              className="mt-3 block h-[26px] w-full"
              viewBox="0 0 100 26"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#c8ff3d" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#c8ff3d" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon ref={areaRef} points={path.area} fill={`url(#${gradId})`} />
              <polyline
                ref={lineRef}
                points={path.points}
                fill="none"
                stroke="#c8ff3d"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
              />
            </svg>
          )}

          <p className="mt-2.5 text-[11px] leading-snug text-ash">{card.note}</p>
        </div>
      </div>
    </div>
  )
}