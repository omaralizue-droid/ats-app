'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  Sparkles,
  Radar,
  Zap,
  UploadCloud,
  Brain,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Star,
  FileSearch,
  Wand2,
  Play,
  Globe,
  Github,
  Twitter,
} from 'lucide-react'

/* ── Ambient background decorations ─────────────────────────────────────── */

function AmbienceLayer() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(204,0,0,0.08) 0%, transparent 70%),' +
            'radial-gradient(ellipse 60% 40% at 85% 30%, rgba(180,0,0,0.05) 0%, transparent 60%),' +
            'radial-gradient(ellipse 50% 60% at 10% 80%, rgba(204,0,0,0.04) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(204,0,0,0.018) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(204,0,0,0.018) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </>
  )
}

/* ── Root page ───────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0608] text-[#e6edf7]">
      <AmbienceLayer />
      <div className="relative z-10">
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
    </div>
  )
}

/* ── Navbar ──────────────────────────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 md:px-12 lg:px-16 ${
        scrolled ? 'border-b border-white/5 bg-[#0a0608]/90 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/zue-logo.png"
          alt="Zue Group of Companies"
          className="h-9 w-auto object-contain"
        />
      </div>

      <div className="hidden items-center gap-8 md:flex">
        {[
          { label: 'Features', href: '#features' },
          { label: 'How It Works', href: '#how-it-works' },
          { label: 'Pricing', href: '#pricing' },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-sm font-medium text-[#8b95a8] transition-colors hover:text-[#e6edf7]"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="hidden text-sm font-medium text-[#8b95a8] transition-colors hover:text-[#e6edf7] sm:block"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #CC0000 0%, #ff3333 100%)',
            boxShadow: '0 0 20px rgba(204,0,0,0.3)',
          }}
        >
          Launch App
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.nav>
  )
}

/* ── Hero ────────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative flex flex-col items-center px-6 pb-24 pt-20 text-center md:pt-28 lg:pt-36">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
        style={{
          background: 'rgba(204,0,0,0.08)',
          border: '1px solid rgba(204,0,0,0.3)',
          color: '#CC0000',
        }}
      >
        <Sparkles className="h-3 w-3" />
        Powered by AI &middot; Built for Modern HR
        <Sparkles className="h-3 w-3" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-5xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
      >
        Screen Resumes at{' '}
        <span className="gradient-text-cyan">Warp Speed</span>{' '}
        with AI Precision
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 max-w-2xl text-base leading-relaxed text-[#8b95a8] sm:text-lg"
      >
        Zue ATS uses cutting-edge AI to instantly parse, score, and rank resumes against your job
        descriptions — so your HR team focuses on the top candidates, not the paperwork.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <Link
          href="/dashboard"
          className="group relative flex items-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold text-[#05070d] transition-all duration-200 hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #CC0000 0%, #ff3333 100%)',
            boxShadow: '0 0 32px rgba(204,0,0,0.4), 0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <Zap className="h-5 w-5" />
          Start Screening Free
        </Link>
        <a
          href="#how-it-works"
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-base font-semibold text-[#e6edf7] transition-all hover:border-white/20 hover:bg-white/[0.06]"
        >
          <Play className="h-4 w-4 text-[#CC0000]" />
          See How It Works
        </a>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-5 text-xs text-[#8b95a8]"
      >
        No credit card required &middot; Free forever plan &middot; GDPR compliant
      </motion.p>

      {/* App preview */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
        className="relative mt-16 w-full max-w-6xl"
      >
        <div
          className="absolute -bottom-12 left-1/2 h-32 w-3/4 -translate-x-1/2 blur-3xl"
          style={{ background: 'rgba(204,0,0,0.15)' }}
        />
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(15,8,8,0.9)',
            border: '1px solid rgba(204,0,0,0.2)',
            boxShadow: '0 0 80px rgba(204,0,0,0.1), 0 40px 100px rgba(0,0,0,0.5)',
          }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-white/5 bg-[#0b1019] px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#FF2D55]/70" />
              <div className="h-3 w-3 rounded-full bg-[#FFB340]/70" />
              <div className="h-3 w-3 rounded-full bg-[#00FF66]/70" />
            </div>
            <div
              className="mx-auto flex items-center gap-2 rounded-lg px-3 py-1 text-xs text-[#8b95a8]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[#CC0000]" />
              zueats.app/dashboard
            </div>
          </div>
          <DashboardMockup />
        </div>
      </motion.div>
    </section>
  )
}

/* ── Dashboard preview mockup ─────────────────────────────────────────────── */

function DashboardMockup() {
  const statData = [
    { label: 'Total', value: '142', color: '#CC0000' },
    { label: 'Avg Score', value: '78%', color: '#10b981' },
    { label: 'Shortlisted', value: '38', color: '#10b981' },
    { label: 'Reviewing', value: '65', color: '#FFB340' },
  ]
  const candidates = [
    { name: 'Sarah Chen', role: 'Senior FE Engineer', score: 96, status: 'Shortlisted', color: '#00FF66' },
    { name: 'Marcus Rodriguez', role: 'Full-Stack Dev', score: 89, status: 'Shortlisted', color: '#00FF66' },
    { name: 'Priya Patel', role: 'React Developer', score: 81, status: 'Review', color: '#FFB340' },
    { name: 'James Kim', role: 'Frontend Dev', score: 74, status: 'Review', color: '#FFB340' },
    { name: 'Anya Ivanova', role: 'UI Engineer', score: 62, status: 'Pending', color: '#8b95a8' },
  ]

  return (
    <div className="flex min-h-[360px] overflow-hidden text-left sm:min-h-[480px]">
      {/* Sidebar */}
      <div
        className="hidden w-[180px] shrink-0 flex-col border-r border-white/5 sm:flex"
        style={{ background: '#0d0606' }}
      >
        <div className="flex h-12 items-center border-b border-white/5 px-4">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/zue-logo.png" alt="Zue" className="h-6 w-auto object-contain" />
          </div>
        </div>
        {['Dashboard', 'Candidates', 'Upload', 'Analytics'].map((item, i) => (
          <div
            key={item}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium ${
              i === 0 ? 'bg-[rgba(204,0,0,0.06)] text-[#CC0000]' : 'text-[#8b95a8]'
            }`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-[#CC0000]' : 'bg-transparent'}`}
            />
            {item}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statData.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 sm:p-4"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${s.color}20`,
              }}
            >
              <p className="text-[9px] uppercase tracking-widest text-[#8b95a8]">{s.label}</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#8b95a8]">
            Top Candidates
          </p>
          <div className="space-y-1.5">
            {candidates.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: `${c.color}20`, color: c.color }}
                >
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#e6edf7]">{c.name}</p>
                  <p className="truncate text-[9px] text-[#8b95a8]">{c.role}</p>
                </div>
                <div
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: `${c.color}15`,
                    color: c.color,
                    border: `1px solid ${c.color}30`,
                  }}
                >
                  {c.status}
                </div>
                <div className="shrink-0 text-sm font-bold" style={{ color: c.color }}>
                  {c.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Logo strip ──────────────────────────────────────────────────────────── */

function LogoStripSection() {
  const companies = [
    'Accenture',
    'Stripe',
    'Notion',
    'Figma',
    'Vercel',
    'Linear',
    'Atlassian',
    'HubSpot',
  ]

  return (
    <section className="border-y border-white/5 bg-white/[0.015] py-10">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#8b95a8]">
        Trusted by HR teams at leading companies
      </p>
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {[...companies, ...companies].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="text-base font-bold tracking-tight text-[#8b95a8]/50"
            >
              {name}
            </span>
          ))}
        </motion.div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#090d16] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#090d16] to-transparent" />
      </div>
    </section>
  )
}

/* ── Features ────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Scoring',
    description:
      'Our LLM engine reads every resume contextually — not just keyword-matching. It understands experience depth, seniority signals, and skill transferability.',
    color: '#00F0FF',
    tag: 'Core',
  },
  {
    icon: FileSearch,
    title: 'Smart JD Parsing',
    description:
      'Paste any job description and NeonATS extracts must-have skills, nice-to-haves, and seniority benchmarks automatically.',
    color: '#00FF66',
    tag: 'Parsing',
  },
  {
    icon: UploadCloud,
    title: 'Multi-Format Upload',
    description:
      'Upload PDFs, DOCX, DOC, and plain TXT files. The parser handles messy formats, OCR artifacts, and unusual layouts gracefully.',
    color: '#00F0FF',
    tag: 'Ingestion',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Score distributions, pipeline funnels, and stage-by-stage breakdowns give recruiters real-time insight into candidate quality.',
    color: '#FFB340',
    tag: 'Analytics',
  },
  {
    icon: ShieldCheck,
    title: 'Bias-Aware Screening',
    description:
      'Built-in guardrails flag potential bias vectors. Scoring focuses purely on role-relevant signals — not demographics.',
    color: '#00FF66',
    tag: 'Ethics',
  },
  {
    icon: Wand2,
    title: 'One-Click Decisions',
    description:
      'Shortlist, reject, or flag for review with a single click. Status changes sync instantly across your team.',
    color: '#B388FF',
    tag: 'Workflow',
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24 md:px-12 lg:px-16">
      <FadeIn className="mb-16 text-center">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#CC0000]">
          Features
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Everything your HR team needs
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[#8b95a8]">
          From upload to decision in seconds. NeonATS handles the heavy lifting so your recruiters
          can focus on building great teams.
        </p>
      </FadeIn>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number]
  index: number
}) {
  const Icon = feature.icon
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-2xl p-6 transition-colors duration-300"
      style={{
        background: 'rgba(18,24,38,0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(14px)',
      }}
      whileHover={{ borderColor: `${feature.color}40`, y: -3 }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-30"
        style={{ background: feature.color }}
      />
      <span
        className="mb-4 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
        style={{
          background: `${feature.color}15`,
          color: feature.color,
          border: `1px solid ${feature.color}30`,
        }}
      >
        {feature.tag}
      </span>
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{
          background: `${feature.color}15`,
          border: `1px solid ${feature.color}30`,
        }}
      >
        <Icon className="h-5 w-5" style={{ color: feature.color }} />
      </div>
      <h3 className="mb-2 text-base font-bold text-[#e6edf7]">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-[#8b95a8]">{feature.description}</p>
    </motion.div>
  )
}

/* ── How It Works ────────────────────────────────────────────────────────── */

const STEPS = [
  {
    number: '01',
    icon: FileSearch,
    title: 'Paste your Job Description',
    description:
      'Drop in the full job description or just the key requirements. Our parser extracts skills, seniority, and must-haves in milliseconds.',
    color: '#00F0FF',
  },
  {
    number: '02',
    icon: UploadCloud,
    title: 'Upload Candidate Resumes',
    description:
      'Drag and drop PDF, DOCX, or TXT resumes — one at a time or in bulk. We handle any layout or formatting.',
    color: '#00FF66',
  },
  {
    number: '03',
    icon: Brain,
    title: 'AI Analyzes & Scores',
    description:
      'Our AI cross-references every candidate against the JD. It scores overall fit, identifies skill gaps, and produces a human-readable verdict.',
    color: '#FFB340',
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Review & Decide',
    description:
      'Candidates are ranked top-to-bottom. Deep-dive into any profile, see AI reasoning, and move candidates through your pipeline with one click.',
    color: '#B388FF',
  },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-6 py-24 md:px-12 lg:px-16">
      <FadeIn className="mb-16 text-center">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#CC0000]">
          How It Works
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          From upload to shortlist in{' '}
          <span className="gradient-text-cyan">30 seconds</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[#8b95a8]">
          Four simple steps replace hours of manual resume sorting.
        </p>
      </FadeIn>
      <div className="relative mx-auto max-w-4xl">
        <div className="absolute left-8 top-0 h-full w-px bg-gradient-to-b from-[#CC0000] via-[#ff3333] to-[#B388FF] opacity-20 md:left-1/2" />
        <div className="flex flex-col gap-12">
          {STEPS.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepCard({
  step,
  index,
}: {
  step: (typeof STEPS)[number]
  index: number
}) {
  const Icon = step.icon
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
      <div className="relative z-10 flex shrink-0 flex-col items-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold"
          style={{
            background: `${step.color}15`,
            border: `2px solid ${step.color}50`,
            color: step.color,
            boxShadow: `0 0 24px ${step.color}25`,
          }}
        >
          {step.number}
        </div>
      </div>
      <div
        className="flex-1 rounded-2xl p-6"
        style={{
          background: 'rgba(18,24,38,0.6)',
          border: `1px solid ${step.color}20`,
          backdropFilter: 'blur(14px)',
        }}
      >
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: `${step.color}15` }}
          >
            <Icon className="h-4 w-4" style={{ color: step.color }} />
          </div>
          <h3 className="text-base font-bold text-[#e6edf7]">{step.title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-[#8b95a8]">{step.description}</p>
      </div>
    </motion.div>
  )
}

/* ── Stats bar ───────────────────────────────────────────────────────────── */

const STATS = [
  { value: '10x', label: 'Faster screening', color: '#CC0000' },
  { value: '94%', label: 'Accuracy vs. expert review', color: '#10b981' },
  { value: '3.2M+', label: 'Resumes processed', color: '#FFB340' },
  { value: '4.9★', label: 'Average rating', color: '#B388FF' },
]

function StatsSection() {
  return (
    <section className="border-y border-white/5 bg-white/[0.015] px-6 py-20 md:px-12 lg:px-16">
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.1} className="text-center">
            <p
              className="text-4xl font-extrabold tracking-tight sm:text-5xl"
              style={{ color: s.color, textShadow: `0 0 20px ${s.color}40` }}
            >
              {s.value}
            </p>
            <p className="mt-2 text-sm text-[#8b95a8]">{s.label}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

/* ── Testimonials ────────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    name: 'Jessica Park',
    role: 'Head of Talent, FinTech Co.',
    avatar: 'JP',
    color: '#CC0000',
    quote:
      'NeonATS cut our time-to-shortlist from 3 days to under an hour. The AI reasoning is genuinely impressive — it catches nuances our human reviewers miss.',
    stars: 5,
  },
  {
    name: 'Tom Bradley',
    role: 'VP Engineering, SaaS Startup',
    avatar: 'TB',
    color: '#00FF66',
    quote:
      'We tripled our hiring pipeline without adding recruiters. The score breakdowns give our HRs confidence, and candidates love the fast turnaround.',
    stars: 5,
  },
  {
    name: 'Ananya Sharma',
    role: 'Talent Acquisition Lead',
    avatar: 'AS',
    color: '#FFB340',
    quote:
      "The bias-awareness feature alone sold me. We've seen more diverse shortlists since switching, and the data backs it up every month.",
    stars: 5,
  },
]

function TestimonialsSection() {
  return (
    <section className="px-6 py-24 md:px-12 lg:px-16">
      <FadeIn className="mb-16 text-center">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#FFB340]">
          Testimonials
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Loved by recruiting teams worldwide
        </h2>
      </FadeIn>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <FadeIn key={t.name} delay={i * 0.1}>
            <div
              className="flex h-full flex-col gap-4 rounded-2xl p-6"
              style={{
                background: 'rgba(18,24,38,0.6)',
                border: `1px solid ${t.color}20`,
                backdropFilter: 'blur(14px)',
              }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-[#FFB340] text-[#FFB340]" />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-[#c8d1df]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: `${t.color}20`,
                    color: t.color,
                    border: `1px solid ${t.color}30`,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#e6edf7]">{t.name}</p>
                  <p className="text-xs text-[#8b95a8]">{t.role}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

/* ── Pricing ─────────────────────────────────────────────────────────────── */

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    color: '#8b95a8',
    highlight: false,
    features: [
      '50 resumes / month',
      '1 active job description',
      'Basic AI scoring',
      'CSV export',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    color: '#CC0000',
    highlight: true,
    features: [
      'Unlimited resumes',
      '10 active job descriptions',
      'Advanced AI + bias guardrails',
      'Analytics dashboard',
      'API access',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    color: '#00FF66',
    highlight: false,
    features: [
      'Everything in Pro',
      'Unlimited JDs',
      'SSO / SAML',
      'Dedicated instance',
      'SLA guarantee',
      'Onboarding & training',
    ],
  },
]

function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24 md:px-12 lg:px-16">
      <FadeIn className="mb-16 text-center">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#B388FF]">
          Pricing
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[#8b95a8]">
          Start free, scale as you grow. No hidden fees, no surprise bills.
        </p>
      </FadeIn>
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan, i) => (
          <FadeIn key={plan.name} delay={i * 0.1}>
            <div
              className="relative flex h-full flex-col rounded-2xl p-6"
              style={{
                background: plan.highlight
                   ? 'linear-gradient(160deg, rgba(204,0,0,0.07) 0%, rgba(180,0,0,0.04) 100%)'
                   : 'rgba(18,10,10,0.6)',
                border: plan.highlight
                   ? '1px solid rgba(204,0,0,0.35)'
                   : '1px solid rgba(255,255,255,0.06)',
                boxShadow: plan.highlight ? '0 0 40px rgba(204,0,0,0.1)' : 'none',
                backdropFilter: 'blur(14px)',
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#05070d]"
                  style={{ background: 'linear-gradient(135deg, #CC0000, #ff3333)' }}
                >
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: plan.color }}
                >
                  {plan.name}
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#e6edf7]">{plan.price}</span>
                  <span className="text-sm text-[#8b95a8]">{plan.period}</span>
                </div>
              </div>
              <ul className="mb-8 flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#c8d1df]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <Link
                  href="/dashboard"
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 hover:opacity-90"
                  style={
                    plan.highlight
                      ? {
                          background: 'linear-gradient(135deg, #CC0000, #ff3333)',
                          color: '#ffffff',
                          boxShadow: '0 0 20px rgba(204,0,0,0.3)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${plan.color}30`,
                          color: plan.color,
                        }
                  }
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get started'}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

/* ── CTA banner ──────────────────────────────────────────────────────────── */

function CtaSection() {
  return (
    <section className="px-6 pb-24 md:px-12 lg:px-16">
      <FadeIn>
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-16 text-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(204,0,0,0.1) 0%, rgba(180,0,0,0.06) 100%)',
            border: '1px solid rgba(204,0,0,0.25)',
            boxShadow: '0 0 80px rgba(204,0,0,0.1)',
          }}
        >
          <div
            className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl"
            style={{ background: 'rgba(204,0,0,0.12)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full blur-3xl"
            style={{ background: 'rgba(180,0,0,0.1)' }}
          />
          <div className="relative">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: 'rgba(204,0,0,0.1)',
                border: '1px solid rgba(204,0,0,0.4)',
                boxShadow: '0 0 32px rgba(204,0,0,0.25)',
              }}
            >
              <Zap className="h-8 w-8 text-[#CC0000]" />
            </div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Ready to transform your hiring?
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-[#8b95a8]">
              Join thousands of HR teams using NeonATS to find their best candidates faster,
              smarter, and more fairly.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold text-white hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #CC0000 0%, #ff3333 100%)',
                  boxShadow: '0 0 32px rgba(204,0,0,0.4)',
                }}
              >
                <Sparkles className="h-5 w-5" />
                Start for Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="mailto:hello@neonats.app"
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 text-base font-semibold text-[#e6edf7] transition-all hover:border-white/20 hover:bg-white/[0.07]"
              >
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}

/* ── Footer ──────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0d0606]/80 px-6 py-12 md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/zue-logo.png" alt="Zue Group of Companies" className="h-8 w-auto object-contain" />
            </div>
            <p className="mb-4 text-sm leading-relaxed text-[#8b95a8]">
              AI-powered applicant tracking by Zue Group of Companies. Screen smarter. Hire
              faster.
            </p>
            <div className="flex gap-3">
              {[Globe, Github, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#8b95a8] transition-all hover:border-white/20 hover:text-[#e6edf7]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'] },
          ].map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#8b95a8]">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#8b95a8] transition-colors hover:text-[#e6edf7]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-[#8b95a8] sm:flex-row">
          <p>&copy; 2026 Zue Group of Companies. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_#10b981]" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── Utility: FadeIn ─────────────────────────────────────────────────────── */

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
