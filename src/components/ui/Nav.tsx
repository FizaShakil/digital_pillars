import { useState } from 'react'
import { NAV_LINKS } from '../../content/data'
import { scrollToTarget } from '../../lib/smooth'
import { LogoMark } from './LogoMark'

/**
 * Fixed top chrome. Pointer-transparent so the 3D scene stays interactive.
 * On mobile: a compact logo + hamburger that expands to a full-screen overlay.
 * On desktop: inline nav links + CTA.
 */
export function Nav() {
  const [open, setOpen] = useState(false)

  const handleNav = (target: string) => {
    setOpen(false)
    scrollToTarget(target, -4)
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-5 sm:px-8">
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault()
            handleNav('#hero')
          }}
          className="pointer-events-auto flex items-center gap-3"
          aria-label="DIGITAL PILLARS — home"
        >
          <LogoMark />
          <span className="label !tracking-[0.22em] text-bone/90">Digital Pillars</span>
        </a>

        {/* desktop nav */}
        <nav className="pointer-events-auto hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.target}
              href={l.target}
              onClick={(e) => {
                e.preventDefault()
                handleNav(l.target)
              }}
              className="label text-ash transition-colors duration-300 hover:text-bone"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              handleNav('#contact')
            }}
            className="btn btn-ghost !px-5 !py-2.5"
          >
            Start a project
          </a>
        </nav>

        {/* mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="pointer-events-auto grid size-10 place-items-center md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span className="sr-only">Menu</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {open ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="2" y1="15" x2="14" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* mobile overlay */}
      <div
        className={`pointer-events-auto fixed inset-0 top-[60px] z-40 flex flex-col items-center justify-center gap-8 bg-ink/95 backdrop-blur-xl transition-all duration-500 md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {NAV_LINKS.map((l, i) => (
          <a
            key={l.target}
            href={l.target}
            onClick={(e) => {
              e.preventDefault()
              handleNav(l.target)
            }}
            className="display text-bone transition-colors hover:text-lime"
            style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)', transitionDelay: open ? `${i * 60}ms` : '0ms' }}
          >
            {l.label}
          </a>
        ))}
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault()
            handleNav('#contact')
          }}
          className="btn btn-lime mt-4 !px-8 !py-4"
          style={{ transitionDelay: open ? `${NAV_LINKS.length * 60}ms` : '0ms' }}
        >
          Start a project
        </a>
      </div>
    </header>
  )
}
