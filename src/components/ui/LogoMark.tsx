export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#0d0f0f" stroke="rgba(242,242,237,0.16)" />
      <g stroke="#c8ff3d" strokeLinecap="round" strokeWidth="2">
        <path d="M6 17v-5" />
        <path d="M10.4 17V9.6" />
        <path d="M14.8 17V7.2" />
        <path d="M19.2 17V4.8" opacity="0.55" />
      </g>
    </svg>
  )
}