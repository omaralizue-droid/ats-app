'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  Radar,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Users,
  ArrowUpRight,
  Sparkles,
  Zap,
} from 'lucide-react'
import StormScene from '@/components/three/StormScene'

// Simulated score badge for the mockup preview
function PreviewScoreBadge({ score }: { score: number }) {
  const radius = 38
  const stroke = 5
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-zinc-950/70 border border-zinc-900 shadow-2xl backdrop-blur-md">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth={stroke} />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#00f0ff"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.6))' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-extrabold tracking-tight text-white font-mono">{score}%</span>
        <span className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold">Match</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Custom cursor states
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [cursorHover, setCursorHover] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDesktop(window.innerWidth >= 768)

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Interactive 3D tilt effect on product mockup preview
  const cardRef = useRef<HTMLDivElement>(null)
  const [tiltStyle, setTiltStyle] = useState("")

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isDesktop) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const tiltX = (y / (rect.height / 2)) * -8
    const tiltY = (x / (rect.width / 2)) * 8
    setTiltStyle(`rotateX(${tiltX}deg) rotateY(${tiltY}deg)`)
  }

  const handleCardMouseLeave = () => {
    setTiltStyle("rotateX(0deg) rotateY(0deg)")
  }

  if (!mounted) return null

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#03030c] text-[#f8fafc] selection:bg-[#00f0ff]/20 selection:text-[#00f0ff] overflow-x-hidden">
      
      {/* Ambient background glow for mobile/desktop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#03030c] to-[#03030c] pointer-events-none z-0" />

      {/* Custom Hover Particle Trail Cursor */}
      {isDesktop && (
        <div
          className="pointer-events-none fixed z-[999] hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/5 transition-all duration-300 ease-out md:block"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            width: cursorHover ? '64px' : '24px',
            height: cursorHover ? '64px' : '24px',
            boxShadow: cursorHover ? '0 0 20px rgba(0, 240, 255, 0.4)' : '0 0 8px rgba(0, 240, 255, 0.1)',
          }}
        />
      )}

      {/* 3D WebGL Storm Background Scene */}
      <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden opacity-90 pointer-events-none">
        <StormScene overlayOpacity={0.35} />
      </div>

      {/* Global Glass Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.03] bg-zinc-950/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/zue-logo.png"
              alt="Zue Group of Companies"
              className="h-8 w-auto object-contain"
            />
          </div>
          <Link
            href="/dashboard"
            onMouseEnter={() => setCursorHover(true)}
            onMouseLeave={() => setCursorHover(false)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
          >
            Launch Dashboard
            <ArrowUpRight className="h-4 w-4 text-[#CC0000]" />
          </Link>
        </div>
      </nav>

      {/* Section 1: Hero Scene Overlay */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-6 pt-28 text-center"
      >
        <div className="flex flex-col items-center max-w-5xl">
          {/* Tag banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.04] bg-white/[0.02] px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 backdrop-blur-md"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
            </span>
            Procedural Screening Engine
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.05]"
          >
            Match Resumes.<br />
            Define Requirements.<br />
            <span className="gradient-text">Screen in Seconds.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base"
          >
            An elite digital product experience evaluating candidate resumes against core engineering requirements in under 20 seconds. Handcrafted visual precision.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/dashboard"
              onMouseEnter={() => setCursorHover(true)}
              onMouseLeave={() => setCursorHover(false)}
              className="group relative inline-flex h-11 items-center justify-center rounded bg-white px-7 text-xs font-bold uppercase tracking-wider text-[#03030c] shadow-2xl transition-all hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#layout-preview"
              onMouseEnter={() => setCursorHover(true)}
              onMouseLeave={() => setCursorHover(false)}
              className="inline-flex h-11 items-center justify-center rounded border border-white/[0.08] bg-white/[0.02] px-7 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-all hover:bg-white/[0.05] hover:text-white"
            >
              Explore Sandbox
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* Section 2: Sandbox Preview */}
      <motion.section
        id="layout-preview"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mx-auto max-w-5xl px-6 py-20"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 p-2 mb-3">
            <Sparkles className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Handcrafted Scorecard Interface</h2>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-md mx-auto">Tactile glass indicators displaying real-time metrics data screening matches.</p>
        </div>

        {/* 3D tilt widget card wrapper */}
        <div
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c14]/40 shadow-2xl backdrop-blur-xl transition-all duration-200 ease-out"
          style={{
            transform: tiltStyle,
            transformStyle: 'preserve-3d',
            perspective: '1000px',
          }}
        >
          {/* Header controls bar */}
          <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.02] px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-800"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-800"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-800"></span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 font-mono">Zue ATS // Model Node Assessment</span>
            <div className="w-12"></div>
          </div>

          {/* Card body */}
          <div className="grid grid-cols-1 md:grid-cols-5 p-8 gap-8">
            <div className="md:col-span-2 flex flex-col items-center justify-center rounded-xl bg-zinc-950/40 border border-white/[0.04] p-6 text-center" style={{ transform: 'translateZ(30px)' }}>
              <PreviewScoreBadge score={92} />
              <div className="mt-5 flex flex-col items-center">
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Strong Shortlist
                </span>
                <span className="text-[10px] text-zinc-500 mt-2 font-mono uppercase tracking-wider">Candidate Scorecard</span>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col gap-5" style={{ transform: 'translateZ(45px)' }}>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Sarah Chen</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Applicant for Lead React Architect</p>
              </div>

              <div className="flex flex-col gap-3.5">
                <div className="rounded-lg bg-zinc-950/20 border border-white/[0.03] p-4">
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-zinc-550 font-mono">AI Assessment</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Highly compatible engineering profile with verified Next.js App Router migration leadership. Mentored junior engineers, established Vitest test coverages, and possesses strong Core Web Vitals optimizations.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                      <CheckCircle2 className="h-3 w-3" />
                      Matched Stack
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">React</span>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">Vitest</span>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">Next.js</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3.5">
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                      <AlertTriangle className="h-3 w-3" />
                      Key Gaps
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400">GraphQL</span>
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400">Apollo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 3: Feature grid cards with hover highlights */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-24 pb-36">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group rounded-xl border border-white/[0.04] bg-[#0c0c14]/30 p-6 backdrop-blur-xl hover:border-[#00f0ff]/20 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-bold text-white tracking-tight">GPU-Accelerated Speeds</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Evaluates code libraries, syntax layouts, and candidate experience patterns in under 20 seconds. Built for scale.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="group rounded-xl border border-white/[0.04] bg-[#0c0c14]/30 p-6 backdrop-blur-xl hover:border-[#00f0ff]/20 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-bold text-white tracking-tight">Rubric Alignment Models</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Precise multi-stage scoring checking technical match ratios, core experience depth, and missing library gaps.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group rounded-xl border border-white/[0.04] bg-[#0c0c14]/30 p-6 backdrop-blur-xl hover:border-[#00f0ff]/20 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-bold text-white tracking-tight">Tactile Workspace controls</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Floating panel overlays, animated charts, and keyboard focus support for high-end workspace pipelines.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Elegant minimalist glass footer */}
      <footer className="relative z-10 border-t border-white/[0.03] bg-zinc-950/20 py-8 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 text-xs text-zinc-650 font-mono">
          <span>© 2026 Zue Group of Companies. Cinematic Screening Interface.</span>
          <div className="flex gap-4">
            <Link href="/dashboard" className="hover:text-white transition-colors">Launch App</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
