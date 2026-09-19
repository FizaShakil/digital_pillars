export type CardZone = 'tr' | 'bl' | 'ml' | 'mr'

export interface MetricCard {
  id: string
  label: string
  /** stat text rendered for reduced-motion / no-JS users */
  value: string
  /** numeric target for the count-up animation (motion users) */
  countTo?: number
  decimals?: number
  prefix?: string
  suffix?: string
  /** comma-group thousands */
  group?: boolean
  delta?: string
  zone: CardZone
  note: string
  /** miniature sparkline values — gives the card a "live" dashboard feel */
  spark?: number[]
}

export interface Service {
  id: string
  index: string
  title: string
  blurb: string
  detail: string
  scope: string[]
  /** proof point rendered in the pillar's own section — keeps each destination distinct */
  signal: { value: string; label: string }
}

export interface Faq {
  id: string
  question: string
  answer: string
}

export interface Testimonial {
  quote: string
  name: string
  role: string
  metric: string
}

export interface NavLink {
  label: string
  target: string
}