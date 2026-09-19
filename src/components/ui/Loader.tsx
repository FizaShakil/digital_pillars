import { LogoMark } from './LogoMark'

/** Full-bleed boot curtain: brand mark + a quiet loading sweep. */
export function Loader() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] grid place-items-center bg-ink"
      style={{ background: 'radial-gradient(ellipse 60% 46% at 50% 40%, #0e1010, #070808 70%)' }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-5">
        <LogoMark size={44} />
        <span className="label">Digital Pillars</span>
        <div className="h-px w-44 overflow-hidden bg-bone/10">
          <div className="h-full w-1/3 animate-[loadbar_1.3s_ease-in-out_infinite] bg-lime/80" />
        </div>
      </div>
    </div>
  )
}