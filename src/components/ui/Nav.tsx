import { NAV_LINKS } from '../../content/data'
import { scrollToTarget } from '../../lib/smooth'
import { LogoMark } from './LogoMark'

/**
 * Fixed top chrome. The header frame is pointer-transparent so the 3D scene
 * stays interactive around it — only the actual nav elements receive clicks.
 */
export function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-5 sm:px-8">
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget(0)
          }}
          className="pointer-events-auto flex items-center gap-3"
          aria-label="DIGITAL PILLARS — home"
        >
          <LogoMark />
          <span className="label !tracking-[0.22em] text-bone/90">Digital Pillars</span>
        </a>

        <nav className="pointer-events-auto hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.target}
              href={l.target}
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget(l.target, -4)
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
              scrollToTarget('#contact', -4)
            }}
            className="btn btn-ghost !px-5 !py-2.5"
          >
            Start a project
          </a>
        </nav>
      </div>
    </header>
  )
}