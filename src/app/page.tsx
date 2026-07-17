'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, Radar, Zap, ChevronDown } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Dynamically loaded — no SSR (WebGL requires browser APIs)
const CinematicScene = dynamic(
  () => import('@/components/three/CinematicScene'),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: '#030412' }}
      >
        <div className="h-[1px] w-24 overflow-hidden bg-white/10">
          <div
            className="h-full animate-[shimmer_1.6s_ease-in-out_infinite]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(100,160,255,0.4), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </div>
    ),
  }
)

// ── Cursor energy trail (canvas 2D overlay) ──────────────────────────────────
function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width  = window.innerWidth
    let height = window.innerHeight
    canvas.width  = width
    canvas.height = height

    const points: { x: number; y: number; age: number }[] = []
    const MAX_POINTS = 32
    let raf: number

    const onMove = (e: MouseEvent) => {
      points.push({ x: e.clientX, y: e.clientY, age: 0 })
      if (points.length > MAX_POINTS) points.shift()
    }

    const onResize = () => {
      width  = window.innerWidth
      height = window.innerHeight
      canvas.width  = width
      canvas.height = height
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 1; i < points.length; i++) {
        const p    = points[i]
        const prev = points[i - 1]
        p.age     += 1
        const lifeRatio = 1 - p.age / MAX_POINTS
        const alpha     = lifeRatio * 0.28

        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(p.x, p.y)
        ctx.strokeStyle = `rgba(80, 160, 255, ${alpha})`
        ctx.lineWidth   = lifeRatio * 2.5
        ctx.lineCap     = 'round'
        ctx.shadowColor = 'rgba(60, 140, 255, 0.5)'
        ctx.shadowBlur  = 8
        ctx.stroke()
      }

      // Remove old points
      while (points.length && points[0].age > MAX_POINTS) points.shift()
      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[5]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

// ── Magnetic button with ripple ──────────────────────────────────────────────
function CinematicButton({
  children,
  href,
  variant = 'primary',
}: {
  children: React.ReactNode
  href: string
  variant?: 'primary' | 'outline'
}) {
  const ref     = useRef<HTMLAnchorElement>(null)
  const ripples = useRef<{ x: number; y: number; id: number }[]>([])
  const [, forceUpdate] = useState(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width  / 2
    const y = e.clientY - rect.top  - rect.height / 2
    el.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`
  }

  const handleMouseLeave = () => {
    if (ref.current) {
      gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.5)', clearProps: 'transform' })
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const id   = Date.now()
    ripples.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, id })
    forceUpdate(n => n + 1)
    setTimeout(() => {
      ripples.current = ripples.current.filter(r => r.id !== id)
      forceUpdate(n => n + 1)
    }, 800)
  }

  const base =
    'group relative inline-flex items-center gap-3 overflow-hidden rounded-full text-sm font-medium tracking-wide transition-all duration-500 select-none'

  const styles =
    variant === 'primary'
      ? 'border border-white/20 bg-white/[0.06] px-8 py-4 text-white hover:border-white/40 hover:bg-white/[0.1]'
      : 'border border-white/10 bg-transparent px-7 py-3.5 text-white/50 hover:text-white/80'

  return (
    <a
      ref={ref}
      href={href}
      className={`${base} ${styles}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ willChange: 'transform' }}
    >
      {/* Ripple effects */}
      {ripples.current.map(r => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/20"
          style={{
            left: r.x - 4,
            top:  r.y - 4,
            width: 8,
            height: 8,
            animation: 'rippleExpand 0.8s ease-out forwards',
          }}
        />
      ))}

      {/* Shimmer sweep on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/8 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      {children}
    </a>
  )
}

// ── Section reveal wrapper ────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 48 },
      {
        opacity: 1, y: 0,
        duration: 1.1,
        delay,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
        },
      }
    )
  }, [delay])

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}

// ── Horizontal rule — elegant separator ──────────────────────────────────────
function Rule() {
  return (
    <div className="mx-auto my-24 h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection({ isMobile }: { isMobile: boolean }) {
  const headRef  = useRef<HTMLHeadingElement>(null)
  const subRef   = useRef<HTMLParagraphElement>(null)
  const ctaRef   = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  const heroY   = useTransform(scrollY, [0, 600], [0, -160])
  const heroOp  = useTransform(scrollY, [0, 500], [1, 0])
  const sceneY  = useTransform(scrollY, [0, 800], [0, 120])

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.8 })
    tl.fromTo(headRef.current,
      { y: 80, opacity: 0, skewY: 3 },
      { y: 0, opacity: 1, skewY: 0, duration: 1.3, ease: 'power4.out' }
    )
    .fromTo(subRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.6'
    )
    .fromTo(ctaRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, '-=0.5'
    )
  }, [])

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* 3D canvas — covers entire viewport */}
      <motion.div style={{ y: sceneY }} className="absolute inset-0 z-0">
        <CinematicScene isMobile={isMobile} />
      </motion.div>

      {/* Text content — centred overlay */}
      <motion.div
        style={{ y: heroY, opacity: heroOp }}
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 pt-36 text-center"
      >
        {/* Eyebrow */}
        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
          <Radar className="h-3 w-3" />
          AI-powered ATS
        </div>

        {/* Headline — large, sparse, intentional */}
        <h1
          ref={headRef}
          className="mx-auto mb-6 max-w-5xl text-5xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-7xl lg:text-[5.5rem]"
          style={{ opacity: 0 }}
        >
          The intelligence<br />
          behind{' '}
          <em
            className="not-italic"
            style={{
              background: 'linear-gradient(135deg, #4090ff 0%, #8040ff 45%, #40c0ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'gradientShift 5s linear infinite',
            }}
          >
            every hire
          </em>
        </h1>

        <p
          ref={subRef}
          className="mx-auto mb-12 max-w-xl text-lg leading-loose text-white/30 sm:text-xl"
          style={{ opacity: 0 }}
        >
          Upload a resume. Define the role. Receive a precise AI match score
          with zero guesswork — in under twenty seconds.
        </p>

        <div ref={ctaRef} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center" style={{ opacity: 0 }}>
          <CinematicButton href="/dashboard" variant="primary">
            <Zap className="h-3.5 w-3.5 opacity-60" />
            Open the Dashboard
            <ArrowUpRight className="h-3.5 w-3.5 opacity-40 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </CinematicButton>
          <CinematicButton href="#process" variant="outline">
            See how it works
          </CinematicButton>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">Scroll</span>
        <ChevronDown className="h-4 w-4 text-white/15" />
      </motion.div>
    </section>
  )
}

// ── Statement section — big typography ──────────────────────────────────────
function StatementSection() {
  return (
    <section className="relative z-10 py-40">
      <div className="mx-auto max-w-6xl px-8">
        <Reveal>
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/25">
            The problem
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="text-4xl font-black leading-[1.1] tracking-[-0.03em] text-white/80 sm:text-6xl lg:text-7xl">
            Hiring teams spend
            <br />
            <span className="text-white/25">
              hours on resumes
            </span>
            <br />
            that take seconds to judge.
          </h2>
        </Reveal>
        <Reveal delay={0.16} className="mt-10">
          <p className="max-w-xl text-lg leading-loose text-white/30">
            The gap between resume volume and hiring quality is widening.
            NeonATS closes it with precision AI scoring — not keyword matching,
            but genuine role alignment analysis.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

// ── Process — horizontal timeline ────────────────────────────────────────────
function ProcessSection() {
  const steps = [
    {
      index: '01',
      title: 'Paste the job description',
      body: 'Define the role in plain language. No special format needed — the AI reads context, not structure.',
    },
    {
      index: '02',
      title: 'Drop the resume',
      body: 'PDF, DOCX, or plain text. Server-side extraction happens in milliseconds. Nothing is stored beyond your session.',
    },
    {
      index: '03',
      title: 'AI runs the analysis',
      body: 'A weighted rubric: 50% technical depth, 35% relevant experience, 15% domain context. Transparent and auditable.',
    },
    {
      index: '04',
      title: 'You decide faster',
      body: 'Match score, skill gaps, key strengths, and a hiring recommendation — one unified view. No interpretation required.',
    },
  ]

  return (
    <section id="process" className="relative z-10 py-32">
      <div className="mx-auto max-w-6xl px-8">
        <Reveal className="mb-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/25">Process</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] text-white/80 sm:text-5xl">
            Four steps.<br />Twenty seconds.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.index} delay={i * 0.09}>
              <div className="group relative border-t border-white/[0.06] py-8 pr-8 transition-colors hover:border-white/[0.14]">
                {/* Index number */}
                <span className="mb-5 block text-[10px] font-bold tracking-[0.2em] text-white/15">
                  {s.index}
                </span>
                <h3 className="mb-3 text-base font-semibold leading-tight text-white/70 group-hover:text-white/90 transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/30">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Proof section ─────────────────────────────────────────────────────────────
function ProofSection() {
  const data = [
    { value: '< 20s', label: 'Per analysis' },
    { value: '95%',   label: 'Scoring accuracy' },
    { value: '10×',   label: 'Faster than manual' },
    { value: '0',     label: 'Setup required' },
  ]

  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-6xl px-8">
        <div className="grid grid-cols-2 gap-px border border-white/[0.06] lg:grid-cols-4">
          {data.map((d, i) => (
            <Reveal key={d.label} delay={i * 0.07}>
              <div className="border-r border-white/[0.04] px-8 py-10 last:border-0">
                <p
                  className="mb-1 text-4xl font-black tracking-tight text-white/80 sm:text-5xl"
                  style={{
                    background: 'linear-gradient(135deg, #4090ff, #8040ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {d.value}
                </p>
                <p className="text-xs text-white/25">{d.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Testimonial — single, full weight ────────────────────────────────────────
function TestimonialSection() {
  return (
    <section className="relative z-10 py-40">
      <div className="mx-auto max-w-4xl px-8">
        <Reveal>
          <blockquote className="text-3xl font-light leading-[1.4] tracking-[-0.01em] text-white/50 sm:text-4xl lg:text-[2.6rem]">
            &ldquo;We cut resume review from three hours to eighteen minutes.
            The AI scoring feels like having a senior recruiter who never
            gets tired or biased.&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px w-8 bg-white/20" />
            <div>
              <p className="text-sm font-semibold text-white/50">Sarah Mitchell</p>
              <p className="text-xs text-white/20">Head of Talent · Series B startup</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CtaSection() {
  return (
    <section className="relative z-10 py-48">
      <div className="mx-auto max-w-4xl px-8 text-center">
        <Reveal>
          <h2 className="mb-4 text-5xl font-black tracking-[-0.04em] text-white/80 sm:text-6xl lg:text-7xl">
            Ready?
          </h2>
          <p className="mx-auto mb-12 max-w-sm text-base text-white/25">
            No account required. No credit card. Drop a resume and see the future of screening.
          </p>
          <CinematicButton href="/dashboard" variant="primary">
            <Zap className="h-3.5 w-3.5 opacity-60" />
            Start for free
            <ArrowUpRight className="h-3.5 w-3.5 opacity-40 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </CinematicButton>
        </Reveal>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.05] py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <Radar className="h-3.5 w-3.5 text-white/20" />
          <span className="text-xs font-semibold text-white/20">NeonATS</span>
        </div>
        <p className="text-[11px] text-white/12">
          © 2026 — Built with Next.js · Three.js · Neon
        </p>
        <Link href="/dashboard" className="text-xs text-white/20 transition-colors hover:text-white/40">
          Dashboard →
        </Link>
      </div>
    </footer>
  )
}

// ── Root page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.navigator.maxTouchPoints > 0 || window.innerWidth < 768)
  }, [])

  return (
    <div
      className="relative overflow-x-hidden text-[#e8edf5]"
      style={{ background: '#030412' }}
    >
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes gradientShift {
          0%   { background-position: 0%   50% }
          50%  { background-position: 100% 50% }
          100% { background-position: 0%   50% }
        }

        @keyframes rippleExpand {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(32);  opacity: 0; }
        }

        @keyframes shimmer {
          0%   { background-position: -200% 0 }
          100% { background-position:  200% 0 }
        }

        ::selection { background: rgba(80,140,255,0.25); }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #030412; }
        ::-webkit-scrollbar-thumb { background: rgba(80,120,255,0.3); border-radius: 2px; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Cursor energy trail — only on desktop */}
      {!isMobile && <CursorTrail />}

      {/* Thin nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.04] bg-[#030412]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-white/30" />
            <span className="text-sm font-bold tracking-tight text-white/50">NeonATS</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-medium text-white/30 transition-colors hover:text-white/60"
          >
            Open app
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </nav>

      {/* All sections */}
      <HeroSection isMobile={isMobile} />
      <StatementSection />
      <Rule />
      <ProcessSection />
      <Rule />
      <ProofSection />
      <Rule />
      <TestimonialSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
