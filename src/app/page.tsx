'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Radar, CheckCircle2, AlertTriangle, ShieldCheck, Clock, Users, ArrowUpRight } from 'lucide-react'

// Simulated score badge for the mockup preview
function PreviewScoreBadge({ score }: { score: number }) {
  const radius = 38
  const stroke = 5
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900/80 border border-zinc-850 shadow-md">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-3xl font-extrabold tracking-tight text-blue-500 font-mono">{score}%</span>
        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-medium">Match</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] selection:bg-blue-500/20 selection:text-blue-400">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {/* Global Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Radar className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-100">NeonATS</span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Launch Dashboard
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 pt-28 sm:pt-36">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-zinc-905 border border-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-400">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            Precise Candidate Alignment
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-4xl font-black tracking-[-0.04em] text-zinc-100 sm:text-6xl md:text-7xl leading-[1.05]">
            Upload a resume.<br />Define the role.<br />
            <span className="bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">Get a precise match score.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            A conversion-oriented screen engine for HR managers. Evaluate candidates against direct technical rubrics and years of experience in under 20 seconds.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-500 px-6 text-sm font-semibold text-white shadow-lg hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              Start screening candidates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="#product-preview"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 text-sm font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-all"
            >
              See product layout
            </a>
          </div>
        </div>

        {/* Product Mockup Preview */}
        <section id="product-preview" className="mt-20 border-t border-zinc-900 pt-16">
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Interactive Product Preview</h2>
            <p className="text-sm text-zinc-400 mt-1">See exactly how candidate matches are broken down in real time.</p>
          </div>

          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-2xl">
            {/* Header window control buttons */}
            <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-900/20 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-zinc-800"></span>
                <span className="h-3 w-3 rounded-full bg-zinc-800"></span>
                <span className="h-3 w-3 rounded-full bg-zinc-800"></span>
              </div>
              <span className="text-[11px] font-medium text-zinc-500 font-mono">NeonATS — Candidate Breakdown</span>
              <div className="w-12"></div>
            </div>

            {/* Layout content of mockup */}
            <div className="grid grid-cols-1 md:grid-cols-5 p-6 gap-6">
              {/* Score section (hero moment) */}
              <div className="md:col-span-2 flex flex-col items-center justify-center rounded-xl bg-zinc-900/35 border border-zinc-900 p-6 text-center">
                <PreviewScoreBadge score={88} />
                <div className="mt-4 flex flex-col items-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" />
                    Strong Shortlist
                  </span>
                  <span className="text-xs text-zinc-500 mt-2">Recommended for interview</span>
                </div>
              </div>

              {/* Rationale & breakdown */}
              <div className="md:col-span-3 flex flex-col gap-4">
                {/* Meta details */}
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 tracking-tight">Sarah Chen</h3>
                  <p className="text-xs text-zinc-400">Candidate for Senior Software Engineer</p>
                </div>

                {/* Rubric cards */}
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="rounded-lg bg-zinc-900/20 border border-zinc-900 p-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">AI Summary Rationale</h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      Sarah demonstrates deep alignment with 5+ years of React/TypeScript experience. Strong match on Next.js App Router and server components. Missing minor Nice-to-Have GraphQL experience.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Matched skills */}
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Matched Stack
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="rounded bg-emerald-500/10 px-1 py-0.5 text-[9px] text-emerald-400">React</span>
                        <span className="rounded bg-emerald-500/10 px-1 py-0.5 text-[9px] text-emerald-400">TypeScript</span>
                        <span className="rounded bg-emerald-500/10 px-1 py-0.5 text-[9px] text-emerald-400">Next.js</span>
                      </div>
                    </div>

                    {/* Missing skills */}
                    <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        Key Gaps
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[9px] text-amber-400">GraphQL</span>
                        <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[9px] text-amber-400">Apollo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="mt-32 pb-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-100 tracking-tight">Rapid Processing</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                From upload to evaluation in under 20 seconds. Built for high-volume recruitment cycles.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-100 tracking-tight">Structured Evaluations</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Rubrics weighted dynamically on tech alignment (50%), experience depth (35%), and domain context (15%).
              </p>
            </div>

            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-100 tracking-tight">Pipeline Centralization</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Manage, rank, and track evaluations inside a secure workspace dashboard without database bloat.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Elegant minimalist footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/40 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-zinc-500">
          <span>© 2026 NeonATS. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/dashboard" className="hover:text-zinc-300">Open Application</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
