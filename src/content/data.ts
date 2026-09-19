import type { Faq, MetricCard, NavLink, Service, Testimonial } from './types'

export const EMAIL = 'hello@digitalpillars.studio'

export const NAV_LINKS: NavLink[] = [
  { label: 'Services', target: '#services' },
  { label: 'Studio', target: '#studio' },
  { label: 'Contact', target: '#contact' },
]

export const HERO_LINES: { text: string; emphasis?: 'outline' | 'lime' }[] = [
  { text: 'Digital' },
  { text: 'Growth', emphasis: 'outline' },
  { text: 'Built in' },
  { text: 'Layers.', emphasis: 'lime' },
]

export const HERO_SUPPORT =
  'Strategy, creative and digital systems built to move your business forward.'

export const HERO_SCROLL_HINT = 'Scroll to go deeper'

export const METRIC_CARDS: MetricCard[] = [
  {
    id: 'roas',
    label: 'ROAS',
    value: '4.82x',
    countTo: 4.82,
    decimals: 2,
    suffix: 'x',
    delta: '+38.6%',
    zone: 'tr',
    note: 'Return on ad spend, rolling 90 days',
    spark: [3.1, 3.4, 3.2, 3.8, 4.1, 3.9, 4.4, 4.82],
  },
  {
    id: 'leads',
    label: 'Live leads',
    value: '1,284',
    countTo: 1284,
    group: true,
    delta: '+24.8%',
    zone: 'bl',
    note: 'Qualified leads tracked this quarter',
    spark: [612, 690, 755, 830, 914, 978, 1120, 1284],
  },
  {
    id: 'reach',
    label: 'Social reach',
    value: '284.6K',
    countTo: 284.6,
    decimals: 1,
    suffix: 'K',
    delta: '+18.4%',
    zone: 'mr',
    note: 'Organic + paid monthly reach',
    spark: [196, 210, 224, 238, 251, 260, 272, 284.6],
  },
  {
    id: 'conv',
    label: 'Conversion',
    value: '7.84%',
    countTo: 7.84,
    decimals: 2,
    suffix: '%',
    zone: 'ml',
    note: 'Site conversion, all channels',
    spark: [5.1, 5.6, 5.8, 6.2, 6.8, 7.1, 7.5, 7.84],
  },
]

export const HERO_CARDS_MIN = ['roas', 'leads'] // visible on small screens only

export const SERVICES: Service[] = [
  {
    id: 'paid-social',
    index: '01',
    title: 'Paid Social',
    blurb: 'Full-funnel paid campaigns across Meta, Google and TikTok.',
    detail:
      'We engineer acquisition funnels end to end — from positioning and audience architecture to creative testing sprints and attribution modelling. Budgets are treated as experiments, not expenses: every dollar is measured and feeding the next decision.',
    scope: ['Funnel engineering', 'Creative testing sprints', 'Attribution modelling'],
    signal: { value: '4.82x', label: 'Blended ROAS, rolling 90 days' },
  },
  {
    id: 'social-presence',
    index: '02',
    title: 'Social Presence',
    blurb: 'Editorial content systems and communities that compound.',
    detail:
      'A social presence is a product, not a posting schedule. We design repeatable content systems, editorial calendars and community operations that build owned audience equity — then loop what works back into paid.',
    scope: ['Content systems', 'Community operations', 'Organic-to-paid loops'],
    signal: { value: '284.6K', label: 'Monthly organic reach, compounding' },
  },
  {
    id: 'digital-experiences',
    index: '03',
    title: 'Digital Experiences',
    blurb: 'Websites and product surfaces engineered with intent.',
    detail:
      'We design and build performance-first digital products — websites, campaigns and interfaces where motion, content and conversion architecture work as one system. Fast by default, measurable by design.',
    scope: ['Web builds', 'Design systems', 'Motion & 3D'],
    signal: { value: '7.84%', label: 'Site conversion, all channels' },
  },
  {
    id: 'consulting',
    index: '04',
    title: 'Consulting',
    blurb: 'Audits and operating systems for in-house teams.',
    detail:
      'For teams ready to build their own growth engine, we provide audits, operating playbooks and embedded guidance — transferring the systems that make growth repeatable, rather than selling the results alone.',
    scope: ['Growth audits', 'Team setup', 'Operating playbooks'],
    signal: { value: '2 wks', label: 'Audit to operating playbook' },
  },
]

export const FAQS: Faq[] = [
  {
    id: 'services',
    question: 'What services do you offer?',
    answer:
      'Four pillars: Paid Social, Social Presence, Digital Experiences and Consulting. Everything is built as an integrated layer — strategy, creative and systems working as one.',
  },
  {
    id: 'start',
    question: 'How do I get started?',
    answer:
      'Reach out from the START A PROJECT button with a short brief. We reply within one business day and schedule a 30-minute kickoff call — no retainer gymnastics, no sales maze.',
  },
  {
    id: 'turnaround',
    question: "What's your typical turnaround?",
    answer:
      'Campaign mechanics launch in 2-3 weeks. A full digital experience typically lands in 6-8 weeks. Consulting audits are delivered in 2 weeks from kickoff.',
  },
  {
    id: 'websites',
    question: 'Do you build websites?',
    answer:
      'Yes — that is our Digital Experiences pillar. High-performance builds engineered around conversion, motion and brand, not template shuffling.',
  },
  {
    id: 'paid-social',
    question: 'Do you manage paid social campaigns?',
    answer:
      'Yes. We run paid social end to end across Meta, Google and TikTok, with creative testing and full attribution attached to the same funnel.',
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'They rebuilt our funnel in layers, and every layer outperformed the last. It stopped feeling like marketing spend and started feeling like infrastructure.',
    name: 'Maya Chen',
    role: 'CMO, Northwind Sleep',
    metric: 'ROAS 4.82x over 6 months',
  },
  {
    quote:
      'The discipline is what changes things. A system we can point to, a loop that keeps compounding — our social feed finally behaves like an asset.',
    name: 'Daniel Osei',
    role: 'Founder, Halide Foods',
    metric: '+284.6K organic reach / month',
  },
  {
    quote:
      'Fast, precise and calm under pressure. They treated our conversion problem like an engineering problem, and the numbers moved in straight lines.',
    name: 'Sofia Reyes',
    role: 'VP Growth, Arco Pay',
    metric: '7.84% conversion, all channels',
  },
]