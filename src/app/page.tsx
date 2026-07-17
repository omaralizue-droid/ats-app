'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Radar,
  Zap,
  Brain,
  BarChart3,
  ShieldCheck,
  UploadCloud,
  ChevronDown,
  CheckCircle2,
  Star,
  Globe,
  Github,
  Twitter,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-2 w-32 overflow-hidden rounded-full bg-white/5">
        <div className="h-full animate-shimmer w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#00cfff]/30 to-transparent" />
      </div>
    </div>
  ),
})

// ── Magnetic button ──────────────────────────────────────────────────────────
function MagneticBtn({
  children,
  href,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode
  href: string
  variant?: 'primary' | 'ghost'
  className?: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setPos({ x: (e.clientX - cx) * 0.35, y: (e.clientY - cy) * 0.35 })
  }

  const handleMouseLeave = () => setPos({ x: 0, y: 0 })

  const base =
    'group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl px-7 py-3.5 text-sm font-semibold transition-all duration-300'
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-r from-[#00cfff] to-[#7c3aed] text-black shadow-[0_0_30px_rgba(0,207,255,0.35)] hover:shadow-[0_0_50px_rgba(0,207,255,0.55)] hover:scale-[1.03]'
      : 'border border-white/10 bg-white/[0.04] text-white/80 hover:border-white/20 hover:bg-white/[0.08] hover:text-white'

  return (
    <motion.a
      ref={ref}
      href={href}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${base} ${styles} ${className}`}
    >
      {children}
      {variant === 'primary' && (
        <span className="absolute inset-0 -z-10 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
      )}
    </motion.a>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', delay: 0.3 }
      )
    }
  }, [])

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/[0.06] bg-[#050508]/80 backdrop-blur-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,207,255,0.15), rgba(124,58,237,0.15))',
              border: '1px solid rgba(0,207,255,0.3)',
              boxShadow: '0 0 24px rgba(0,207,255,0.2)',
            }}
          >
            <Radar className="h-4.5 w-4.5 text-[#00cfff]" />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #00cfff, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NeonATS
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {['Features', 'How It Works', 'Pricing'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm font-medium text-white/50 transition-colors hover:text-white"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-white/50 transition-colors hover:text-white sm:block"
          >
            Sign in
          </Link>
          <MagneticBtn href="/dashboard" variant="primary">
            Launch App <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </MagneticBtn>
        </div>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, -120])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const sceneY = useTransform(scrollY, [0, 600], [0, 80])

  useEffect(() => {
    if (!textRef.current) return
    const els = textRef.current.querySelectorAll('[data-reveal]')
    gsap.fromTo(els,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1.1, stagger: 0.12,
        ease: 'power4.out', delay: 0.5,
      }
    )
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Three.js canvas */}
      <motion.div
        style={{ y: sceneY }}
        className="absolute inset-0 z-0"
      >
        <HeroScene />
      </motion.div>

      {/* Dark vignette radial overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, #050508 70%)',
        }}
      />

      {/* Text content */}
      <motion.div
        ref={textRef}
        style={{ y, opacity }}
        className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-32 text-center"
      >
        {/* Badge */}
        <div data-reveal className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(0,207,255,0.25)] bg-[rgba(0,207,255,0.06)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#00cfff]">
          <Sparkles className="h-3 w-3" />
          AI-Powered Resume Intelligence
          <Sparkles className="h-3 w-3" />
        </div>

        {/* Headline */}
        <h1
          data-reveal
          className="mb-6 text-5xl font-black leading-[1.05] tracking-[-0.03em] sm:text-7xl lg:text-8xl"
        >
          Screen Talent at{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #00cfff 0%, #7c3aed 50%, #00cfff 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 4s linear infinite',
            }}
          >
            Warp Speed
          </span>
        </h1>

        {/* Subtitle */}
        <p
          data-reveal
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/50 sm:text-xl"
        >
          Drop a resume. Paste a JD. Get an AI-powered ATS match score, skill gaps,
          and hiring recommendation — in under 20 seconds.
        </p>

        {/* CTAs */}
        <div data-reveal className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticBtn href="/dashboard" variant="primary" className="text-base px-8 py-4">
            <Zap className="h-4 w-4" />
            Start Screening Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </MagneticBtn>
          <MagneticBtn href="#features" variant="ghost" className="text-base px-8 py-4">
            See How It Works
          </MagneticBtn>
        </div>

        {/* Social proof */}
        <div data-reveal className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/30">
          {['No credit card', 'Works on PDF, DOCX, TXT', 'Results in &lt;20s'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00cfff]" />
              <span dangerouslySetInnerHTML={{ __html: t }} />
            </span>
          ))}
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="h-5 w-5 text-white/20" />
      </motion.div>
    </section>
  )
}

// ── Stat ticker ───────────────────────────────────────────────────────────────
function LogoStripSection() {
  const stats = [
    { value: '10x', label: 'Faster screening' },
    { value: '95%', label: 'Accuracy rate' },
    { value: '< 20s', label: 'Per resume' },
    { value: '3 formats', label: 'PDF · DOCX · TXT' },
    { value: '0 setup', label: 'Just paste & drop' },
  ]

  return (
    <section className="relative z-10 border-y border-white/[0.06] bg-[#050508]/60 py-6 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-around gap-8 px-6 flex-wrap">
        {stats.map((s) => (
          <div key={s.value} className="text-center">
            <p
              className="text-2xl font-black"
              style={{
                background: 'linear-gradient(90deg, #00cfff, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {s.value}
            </p>
            <p className="mt-0.5 text-xs text-white/35">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Feature cards ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Brain,
    title: 'AI Match Scoring',
    desc: 'Weighted scoring rubric: 50% technical skills, 35% experience, 15% domain fit. Non-inflated, realistic scores every time.',
    color: '#00cfff',
  },
  {
    icon: UploadCloud,
    title: 'Multi-Format Upload',
    desc: 'Drop PDF, DOCX, or TXT resumes. Server-side text extraction means no data leaves without your consent.',
    color: '#7c3aed',
  },
  {
    icon: BarChart3,
    title: 'Pipeline Analytics',
    desc: 'Score distribution charts, status breakdowns, and hiring funnel metrics — all in real time.',
    color: '#00cfff',
  },
  {
    icon: Zap,
    title: 'Under 20 Seconds',
    desc: 'From upload to full AI evaluation in under 20 seconds. No waiting, no bottlenecks.',
    color: '#7c3aed',
  },
  {
    icon: ShieldCheck,
    title: 'Rigorous & Fair',
    desc: 'Skills gaps are verified against the JD — the AI never fabricates requirements. Transparent and auditable.',
    color: '#00cfff',
  },
  {
    icon: Globe,
    title: 'Deploy Anywhere',
    desc: 'Fully open-source, runs on Vercel + Neon Postgres. Your data, your infrastructure.',
    color: '#7c3aed',
  },
]

function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const cards = ref.current.querySelectorAll('[data-card]')
    gsap.fromTo(cards,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: 'power4.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])

  return (
    <section id="features" className="relative z-10 py-28" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#00cfff]">Features</p>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Built for modern{' '}
            <span style={{ background: 'linear-gradient(90deg, #00cfff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              hiring teams
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/40">
            Every feature is designed to reduce time-to-hire without sacrificing accuracy or fairness.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                data-card
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] p-6 transition-all duration-500 hover:border-white/[0.14]"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at top left, ${f.color}0f 0%, transparent 70%)`,
                  }}
                />
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    background: `${f.color}15`,
                    border: `1px solid ${f.color}30`,
                    boxShadow: `0 0 20px ${f.color}20`,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <h3 className="mb-2 text-base font-semibold tracking-tight text-white/90">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/40">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { n: '01', title: 'Paste your JD', desc: 'Drop the job description into the editor. Or use our sample Senior Frontend Engineer JD.' },
    { n: '02', title: 'Upload the resume', desc: 'Drag & drop a PDF, DOCX or TXT file. Text is extracted server-side instantly.' },
    { n: '03', title: 'AI analysis runs', desc: 'Our LLM evaluates skills, experience years, role alignment, and outputs a weighted score.' },
    { n: '04', title: 'Review & decide', desc: 'See the full breakdown, skill gaps, key strengths, and AI recommendation in the dashboard.' },
  ]

  return (
    <section id="how-it-works" className="relative z-10 py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#00cfff]">Process</p>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">How it works</h2>
        </div>
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line */}
          <div className="absolute left-8 top-10 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-[#00cfff]/20 via-[#7c3aed]/20 to-transparent lg:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 0.6, 0.36, 1] }}
              viewport={{ once: true }}
              className="relative rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-sm"
            >
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,207,255,0.15), rgba(124,58,237,0.15))',
                  border: '1px solid rgba(0,207,255,0.25)',
                  color: '#00cfff',
                }}
              >
                {s.n}
              </div>
              <h3 className="mb-2 text-base font-semibold text-white/90">{s.title}</h3>
              <p className="text-sm leading-relaxed text-white/40">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: '10,000+', label: 'Resumes analyzed' },
    { value: '95%', label: 'Score accuracy' },
    { value: '4.9 / 5', label: 'Recruiter rating' },
    { value: '87%', label: 'Time saved per hire' },
  ]

  return (
    <section className="relative z-10 py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-16"
          style={{
            background: 'linear-gradient(135deg, rgba(0,207,255,0.06) 0%, rgba(124,58,237,0.06) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* BG decoration */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,207,255,0.12) 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />

          <div className="relative grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p
                  className="text-4xl font-black tracking-tight sm:text-5xl"
                  style={{
                    background: 'linear-gradient(135deg, #00cfff, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-white/40">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Sarah Mitchell', role: 'Head of Talent, Stripe-backed startup', text: 'We cut resume review time from 3 hours to 20 minutes. The AI scoring is remarkably accurate — no inflated scores.' },
  { name: 'James Okafor', role: 'Senior Recruiter, Tech Agency', text: "The skill gap analysis alone saves me 2+ hours per hire. It surfaces exactly what's missing without hallucinating requirements." },
  { name: 'Priya Nair', role: 'Engineering Manager', text: "Finally an ATS that doesn't just keyword-match. The weighted scoring actually reflects what matters for senior engineering roles." },
]

function TestimonialsSection() {
  return (
    <section className="relative z-10 py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#00cfff]">Reviews</p>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Loved by recruiters</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-[#00cfff] text-[#00cfff]" />
                ))}
              </div>
              <p className="mb-5 text-sm leading-relaxed text-white/60">&ldquo;{t.text}&rdquo;</p>
              <div>
                <p className="text-sm font-semibold text-white/90">{t.name}</p>
                <p className="text-xs text-white/35">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function PricingSection() {
  const plans = [
    {
      name: 'Free', price: '$0', period: 'forever',
      features: ['Unlimited uploads', 'AI match scoring', 'PDF · DOCX · TXT', 'Pipeline dashboard'],
      cta: 'Get started', popular: false,
    },
    {
      name: 'Pro', price: '$29', period: 'per month',
      features: ['Everything in Free', 'Priority AI processing', 'Team collaboration', 'Export to CSV', 'API access'],
      cta: 'Start free trial', popular: true,
    },
    {
      name: 'Enterprise', price: 'Custom', period: 'contact us',
      features: ['Everything in Pro', 'Dedicated instance', 'SSO / SAML', 'Custom AI tuning', 'SLA guarantee'],
      cta: 'Contact sales', popular: false,
    },
  ]

  return (
    <section id="pricing" className="relative z-10 py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#00cfff]">Pricing</p>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Simple, transparent pricing</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl border p-7"
              style={{
                background: p.popular
                  ? 'linear-gradient(135deg, rgba(0,207,255,0.08), rgba(124,58,237,0.08))'
                  : 'rgba(255,255,255,0.025)',
                border: p.popular ? '1px solid rgba(0,207,255,0.3)' : '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(16px)',
                boxShadow: p.popular ? '0 0 40px rgba(0,207,255,0.1)' : 'none',
              }}
            >
              {p.popular && (
                <span
                  className="absolute right-5 top-5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black"
                  style={{ background: 'linear-gradient(90deg, #00cfff, #7c3aed)' }}
                >
                  Most Popular
                </span>
              )}
              <p className="mb-1 text-sm font-semibold text-white/50">{p.name}</p>
              <p className="mb-1">
                <span className="text-4xl font-black text-white">{p.price}</span>
                <span className="ml-1 text-sm text-white/35">/ {p.period}</span>
              </p>
              <div className="my-6 h-px bg-white/[0.06]" />
              <ul className="mb-7 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-[#00cfff]" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/dashboard"
                className="block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-300"
                style={
                  p.popular
                    ? {
                        background: 'linear-gradient(135deg, #00cfff, #7c3aed)',
                        color: '#000',
                        boxShadow: '0 0 24px rgba(0,207,255,0.3)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }
                }
              >
                {p.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CtaSection() {
  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Start screening{' '}
            <span style={{ background: 'linear-gradient(90deg, #00cfff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              smarter
            </span>{' '}
            today
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-white/40">
            No setup. No credit card. Just drop a resume and experience AI hiring intelligence.
          </p>
          <MagneticBtn href="/dashboard" variant="primary" className="text-base px-10 py-4">
            <Zap className="h-4 w-4" />
            Launch NeonATS Free
            <ArrowRight className="h-4 w-4" />
          </MagneticBtn>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-[#050508]/80 py-10 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Radar className="h-4 w-4 text-[#00cfff]" />
          <span
            className="text-sm font-bold"
            style={{ background: 'linear-gradient(90deg, #00cfff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            NeonATS
          </span>
          <span className="text-xs text-white/25">AI Resume ATS</span>
        </div>
        <p className="text-xs text-white/25">© 2026 NeonATS. Built with Next.js · Three.js · Neon · z-ai SDK</p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-white/25 transition-colors hover:text-white/60"><Globe className="h-4 w-4" /></a>
          <a href="#" className="text-white/25 transition-colors hover:text-white/60"><Github className="h-4 w-4" /></a>
          <a href="#" className="text-white/25 transition-colors hover:text-white/60"><Twitter className="h-4 w-4" /></a>
        </div>
      </div>
    </footer>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden text-[#e8edf5]"
      style={{ background: '#050508' }}
    >
      {/* Global gradient shift animation */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50% }
          50%  { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%) }
          100% { transform: translateX(400%) }
        }
        .animate-shimmer { animation: shimmer 1.8s infinite }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important }
        }
      `}</style>

      <Navbar />
      <HeroSection />
      <LogoStripSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
