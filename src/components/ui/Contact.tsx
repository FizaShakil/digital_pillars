import { EMAIL, HERO_SUPPORT } from '../../content/data'
import { useMagnetic } from '../../lib/ux'
import { LogoMark } from './LogoMark'

export function Contact() {
  const ctaRef = useMagnetic<HTMLAnchorElement>()

  return (
    <>
      <section id="contact" className="pointer-events-auto relative z-10 scroll-mt-24">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center px-5 pb-[12vh] pt-[14vh] text-center sm:px-8 sm:pt-[18vh]">
          <p className="label" data-parallax data-depth="0.06">03 — Start</p>
          <h2
            data-reveal="pop"
            className="display mt-6 text-bone"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 5.6rem)' }}
          >
            Think in layers.
          </h2>
          <p
            data-reveal="up"
            className="mt-5 max-w-md text-[15px] leading-relaxed text-ash"
          >
            {HERO_SUPPORT}
          </p>

          <div data-reveal="up" className="mt-10">
            <a
              ref={ctaRef}
              href={`mailto:${EMAIL}?subject=Start%20a%20project`}
              className="btn btn-lime !px-8 !py-4 text-[13px]"
            >
              Start a project
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 12 12 2M12 2H4M12 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <p data-reveal="up" className="label mt-5">
            or write to&nbsp;
            <a href={`mailto:${EMAIL}`} className="text-bone/80 transition-colors hover:text-lime">
              {EMAIL}
            </a>
          </p>
        </div>
      </section>

      <footer className="pointer-events-auto relative z-10 border-t border-bone/10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <span className="flex items-center gap-3">
            <LogoMark size={18} />
            <span className="label">Digital Pillars</span>
          </span>
          <span className="label">© 2026 Digital Pillars</span>
          <span className="label hidden sm:block">Growth, built in layers.</span>
        </div>
      </footer>
    </>
  )
}