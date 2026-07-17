'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sidebar,
  UploadZone,
  JobDescriptionInput,
  CandidateTable,
  CandidateDetail,
  StatCards,
} from '@/components/ats'
import type { SidebarStats } from '@/components/ats'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import type { Candidate, CandidateStatus } from '@/lib/types'
import {
  RefreshCw,
  Sparkles,
  Zap,
  FileSearch,
  Wand2,
  TrendingUp,
  Users,
  Gauge,
  ThumbsUp,
  Clock,
  XCircle,
  ArrowUpRight,
} from 'lucide-react'

/* ── Sample data ─────────────────────────────────────────────────────────── */

const SAMPLE_JD = `Senior Frontend Engineer

We are seeking a Senior Frontend Engineer to join our platform team. You will build performant, accessible web applications used by millions.

Required Skills:
- 5+ years of professional experience with React and TypeScript
- Deep expertise in Next.js (App Router) and server components
- Strong CSS skills including Tailwind CSS and responsive design
- Experience with state management (Zustand, Redux, or TanStack Query)
- Test-driven development with Vitest or Jest and Playwright
- Performance optimization and Core Web Vitals
- Accessibility (WCAG 2.1 AA)
- Git and CI/CD pipelines

Nice to Have:
- Experience with GraphQL and Apollo
- WebSockets and real-time systems
- Design systems and Storybook
- Node.js backend experience
- AWS or Vercel deployment

You will collaborate with designers and backend engineers to ship features end-to-end. Strong communication and mentorship of junior engineers expected.`

const SAMPLE_RESUME = `Sarah Chen
sarah.chen@email.com | +1 (415) 555-0142 | San Francisco, CA

Senior Software Engineer

EXPERIENCE
Senior Frontend Engineer, TechCorp (2021 - Present)
- Led migration of a legacy React app to Next.js 14 App Router, improving LCP by 40%
- Built a design system in TypeScript with 60+ components and Storybook docs
- Mentored 3 junior engineers and established TDD practices with Vitest and Playwright
- Optimized Core Web Vitals; achieved 98+ Lighthouse performance scores

Frontend Engineer, StartupXYZ (2018 - 2021)
- Developed React + TypeScript customer dashboard used by 200k+ users
- Implemented state management with Zustand and TanStack Query
- Built real-time notification system with WebSockets
- Set up CI/CD on GitHub Actions and deployed to Vercel

SKILLS
React, TypeScript, Next.js, Tailwind CSS, Zustand, TanStack Query, GraphQL, Apollo, Vitest, Jest, Playwright, Storybook, Node.js, Git, CI/CD, WebSockets, Accessibility (WCAG), Performance Optimization

EDUCATION
B.S. Computer Science, UC Berkeley, 2018`

/* ── Root page ────────────────────────────────────────────────────────────── */

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jdText, setJdText] = useState('')
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/candidates')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCandidates(data.candidates || [])
    } catch {
      toast({ title: 'Connection error', description: 'Could not load candidates.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  const handleFileUploaded = useCallback(async (data: { fileName: string; file: File }) => {
    if (jdText.trim().length < 60) {
      toast({ title: 'Job description required', description: 'Paste a JD before uploading.', variant: 'destructive' })
      return
    }
    setAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('file', data.file)
      formData.append('jobDescription', jdText)
      formData.append('fileName', data.fileName)

      const analyzeRes = await fetch('/api/analyze', { method: 'POST', body: formData })
      if (!analyzeRes.ok) {
        const err = await analyzeRes.json().catch(() => ({}))
        throw new Error(err.error || 'AI analysis failed.')
      }
      const { result, extractedText } = await analyzeRes.json()

      const createRes = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...result, fileName: data.fileName, jdText, rawText: extractedText }),
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save candidate.')
      }
      const { candidate } = await createRes.json()
      setCandidates(prev => [candidate, ...prev].sort((a, b) => b.matchScore - a.matchScore))
      toast({ title: 'Resume analyzed', description: `${candidate.name} scored ${candidate.matchScore}% — ${candidate.verdict}.` })
    } catch (err) {
      toast({ title: 'Analysis failed', description: err instanceof Error ? err.message : 'Unexpected error.', variant: 'destructive' })
    } finally {
      setAnalyzing(false)
    }
  }, [jdText])

  const handleStatusChange = useCallback(async (id: string, status: CandidateStatus) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    setSelectedCandidate(prev => prev && prev.id === id ? { ...prev, status } : prev)
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      const { candidate } = await res.json()
      setCandidates(prev => prev.map(c => c.id === id ? candidate : c))
      setSelectedCandidate(prev => prev && prev.id === id ? candidate : prev)
    } catch {
      toast({ title: 'Update failed', description: 'Could not update status.', variant: 'destructive' })
      fetchCandidates()
    }
  }, [fetchCandidates])

  const handleSelectCandidate = useCallback((c: Candidate) => {
    setSelectedCandidate(c)
    setDetailOpen(true)
  }, [])

  const handleLoadSampleJD = useCallback(() => {
    setJdText(SAMPLE_JD)
    toast({ title: 'Sample JD loaded', description: 'Senior Frontend Engineer JD is ready.' })
  }, [])

  const stats: SidebarStats = useMemo(() => ({
    total: candidates.length,
    shortlisted: candidates.filter(c => c.status === 'SHORTLIST').length,
    review: candidates.filter(c => c.status === 'REVIEW').length,
    rejected: candidates.filter(c => c.status === 'REJECT').length,
    avgScore: candidates.length ? Math.round(candidates.reduce((s, c) => s + c.matchScore, 0) / candidates.length) : 0,
  }), [candidates])

  const viewTitle: Record<string, string> = {
    dashboard: 'Dashboard',
    upload: 'Upload Resume',
    candidates: 'Candidates',
    analytics: 'Analytics',
  }

  const viewSubtitle: Record<string, string> = {
    dashboard: 'AI-powered resume screening at a glance',
    upload: 'Drop a resume and let the AI evaluate it against the JD',
    candidates: 'All candidates ranked by AI match score',
    analytics: 'Pipeline distribution and score insights',
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#030412' }}>
      <div className="flex flex-1">
        <Sidebar activeView={activeView} onNavigate={setActiveView} stats={stats} />

        {/* Main content */}
        <main className="custom-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-7 lg:px-10">

            {/* ── Page header ── */}
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2.5">
                  <h1 className="text-2xl font-black tracking-[-0.03em] text-white/80 sm:text-3xl">
                    {viewTitle[activeView]}
                  </h1>
                  <span
                    className="rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      borderColor: 'rgba(64,144,255,0.25)',
                      background: 'rgba(64,144,255,0.06)',
                      color: '#4090ff',
                    }}
                  >
                    AI
                  </span>
                </div>
                <p className="text-sm text-white/30">{viewSubtitle[activeView]}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadSampleJD}
                  className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/40 transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white/70"
                >
                  <Wand2 className="h-3 w-3" />
                  Sample JD
                </button>
                <button
                  onClick={fetchCandidates}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/40 transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white/70 disabled:opacity-40"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin-slow' : ''}`} />
                  Refresh
                </button>
              </div>
            </header>

            {/* ── View content ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {activeView === 'dashboard' && (
                  <DashboardView
                    candidates={candidates}
                    loading={loading}
                    jdText={jdText}
                    onJdChange={setJdText}
                    onFileUploaded={handleFileUploaded}
                    onSelectCandidate={handleSelectCandidate}
                    onStatusChange={handleStatusChange}
                    onNavigate={setActiveView}
                  />
                )}
                {activeView === 'upload' && (
                  <UploadView jdText={jdText} onJdChange={setJdText} onFileUploaded={handleFileUploaded} />
                )}
                {activeView === 'candidates' && (
                  <CandidatesView
                    candidates={candidates}
                    loading={loading}
                    onSelectCandidate={handleSelectCandidate}
                    onStatusChange={handleStatusChange}
                  />
                )}
                {activeView === 'analytics' && (
                  <AnalyticsView candidates={candidates} stats={stats} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-[#030412]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3.5 sm:px-7 lg:px-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-[#4090ff]" />
            <span className="text-xs font-semibold gradient-text">NeonATS</span>
            <span className="text-xs text-white/20">· AI resume screening</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/20">
            <span className="hidden sm:inline">Next.js · Three.js · Neon</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#40d080]" style={{ boxShadow: '0 0 6px #40d080' }} />
              Operational
            </span>
          </div>
        </div>
      </footer>

      {/* Candidate detail */}
      <CandidateDetail
        candidate={selectedCandidate}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusChange={handleStatusChange}
      />

      {/* AI analyzing overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'rgba(3,4,18,0.88)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="flex flex-col items-center gap-6 rounded-2xl border border-white/[0.07] px-10 py-10"
              style={{
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 0 60px rgba(64,144,255,0.08), 0 40px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Orbital spinner */}
              <div className="relative flex h-20 w-20 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/[0.07]"
                  style={{ borderTopColor: 'rgba(64,144,255,0.7)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-3 rounded-full border border-white/[0.04]"
                  style={{ borderBottomColor: 'rgba(128,64,255,0.5)' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <Sparkles className="h-6 w-6 text-[#4090ff]" />
              </div>

              <div className="text-center">
                <p className="text-base font-semibold text-white/80">Analyzing resume</p>
                <p className="mt-1.5 text-sm text-white/30">Parsing · matching skills · scoring fit</p>
              </div>

              {/* Pulse dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="h-1 w-1 rounded-full bg-[#4090ff]"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Section header shared component ──────────────────────────────────────── */
function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4090ff]"
        style={{ background: 'rgba(64,144,255,0.06)', border: '1px solid rgba(64,144,255,0.15)' }}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-white/70">{title}</h2>
        <p className="text-xs text-white/30">{subtitle}</p>
      </div>
    </div>
  )
}

/* ── Thin divider ─────────────────────────────────────────────────────────── */
function Divider() {
  return <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
}

/* ── Dashboard view ──────────────────────────────────────────────────────── */
function DashboardView({
  candidates, loading, jdText, onJdChange,
  onFileUploaded, onSelectCandidate, onStatusChange, onNavigate,
}: {
  candidates: Candidate[]
  loading: boolean
  jdText: string
  onJdChange: (v: string) => void
  onFileUploaded: (data: { fileName: string; file: File }) => void
  onSelectCandidate: (c: Candidate) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
  onNavigate: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <StatCards candidates={candidates} />
      <Divider />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionHeader
            icon={<Zap className="h-3.5 w-3.5" />}
            title="Upload Resume"
            subtitle="Drop a file to run AI matching"
          />
          <div className="mt-4">
            <UploadZone onFileUploaded={onFileUploaded} disabled={jdText.trim().length < 60} />
            {jdText.trim().length < 60 && (
              <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[#ffb340]/70">
                <FileSearch className="h-3 w-3" />
                Paste a job description below to enable uploads
              </p>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <SectionHeader
            icon={<FileSearch className="h-3.5 w-3.5" />}
            title="Job Description"
            subtitle="The target role to match against"
          />
          <div className="mt-4">
            <JobDescriptionInput value={jdText} onChange={onJdChange} />
          </div>
        </div>
      </div>

      <Divider />

      <div>
        <div className="flex items-center justify-between">
          <SectionHeader
            icon={<Users className="h-3.5 w-3.5" />}
            title="Top Candidates"
            subtitle="Ranked by AI match score"
          />
          {candidates.length > 0 && (
            <button
              onClick={() => onNavigate('candidates')}
              className="flex items-center gap-1 text-xs text-white/30 transition-colors hover:text-white/60"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="mt-4">
          <CandidateTable
            candidates={candidates.slice(0, 6)}
            loading={loading}
            onSelectCandidate={onSelectCandidate}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Upload view ─────────────────────────────────────────────────────────── */
function UploadView({ jdText, onJdChange, onFileUploaded }: {
  jdText: string
  onJdChange: (v: string) => void
  onFileUploaded: (data: { fileName: string; file: File }) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <SectionHeader
          icon={<Zap className="h-3.5 w-3.5" />}
          title="Resume Upload"
          subtitle="PDF, DOCX, or TXT — up to 10MB"
        />
        <div className="mt-4">
          <UploadZone onFileUploaded={onFileUploaded} disabled={jdText.trim().length < 60} />
          {jdText.trim().length < 60 && (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[#ffb340]/70">
              <FileSearch className="h-3 w-3" />
              A job description is required before uploading
            </p>
          )}
        </div>
      </div>
      <div>
        <SectionHeader
          icon={<FileSearch className="h-3.5 w-3.5" />}
          title="Target Job Description"
          subtitle="Paste the role requirements here"
        />
        <div className="mt-4">
          <JobDescriptionInput value={jdText} onChange={onJdChange} />
        </div>
      </div>
    </div>
  )
}

/* ── Candidates view ─────────────────────────────────────────────────────── */
function CandidatesView({ candidates, loading, onSelectCandidate, onStatusChange }: {
  candidates: Candidate[]
  loading: boolean
  onSelectCandidate: (c: Candidate) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <StatCards candidates={candidates} />
      <Divider />
      <div>
        <SectionHeader
          icon={<Users className="h-3.5 w-3.5" />}
          title="All Candidates"
          subtitle={`${candidates.length} total · sorted by match score`}
        />
        <div className="mt-4">
          <CandidateTable
            candidates={candidates}
            loading={loading}
            onSelectCandidate={onSelectCandidate}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Analytics view ──────────────────────────────────────────────────────── */
function AnalyticsView({ candidates, stats }: { candidates: Candidate[]; stats: SidebarStats }) {
  const scoreBands = useMemo(() => {
    const bands = [
      { label: '90–100', min: 90, max: 100, color: '#40d080' },
      { label: '75–89',  min: 75, max: 89,  color: '#4090ff' },
      { label: '50–74',  min: 50, max: 74,  color: '#ffb340' },
      { label: '0–49',   min: 0,  max: 49,  color: '#ff4060' },
    ]
    return bands.map(b => ({
      ...b,
      count: candidates.filter(c => c.matchScore >= b.min && c.matchScore <= b.max).length,
    }))
  }, [candidates])

  const maxCount = Math.max(1, ...scoreBands.map(b => b.count))

  const statusBreakdown = [
    { label: 'Shortlisted', value: stats.shortlisted, color: '#40d080', icon: ThumbsUp },
    { label: 'Review',      value: stats.review,      color: '#ffb340', icon: Clock    },
    { label: 'Rejected',    value: stats.rejected,    color: '#ff4060', icon: XCircle  },
  ]

  const emptyState = (text: string) => (
    <p className="py-10 text-center text-sm text-white/20">{text}</p>
  )

  return (
    <div className="flex flex-col gap-8">
      <StatCards candidates={candidates} />
      <Divider />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Score distribution */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="mb-5 flex items-center gap-2.5">
            <TrendingUp className="h-4 w-4 text-[#4090ff]" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              Score Distribution
            </h3>
          </div>
          {candidates.length === 0 ? emptyState('Upload resumes to see score distribution.') : (
            <div className="flex flex-col gap-3">
              {scoreBands.map(band => (
                <div key={band.label} className="flex items-center gap-3">
                  <span className="w-14 text-xs font-medium text-white/25">{band.label}</span>
                  <div className="relative h-8 flex-1 overflow-hidden rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-lg"
                      style={{
                        backgroundColor: `${band.color}18`,
                        borderRight: `2px solid ${band.color}60`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(band.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 0.6, 0.36, 1] }}
                    />
                    <span className="absolute inset-y-0 left-3 flex items-center text-sm font-bold" style={{ color: band.color }}>
                      {band.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline status */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="mb-5 flex items-center gap-2.5">
            <Gauge className="h-4 w-4 text-[#40d080]" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              Pipeline Status
            </h3>
          </div>
          {candidates.length === 0 ? emptyState('No candidates in the pipeline yet.') : (
            <div className="flex flex-col gap-5">
              {statusBreakdown.map(s => {
                const pct = stats.total > 0 ? Math.round((s.value / stats.total) * 100) : 0
                const Icon = s.icon
                return (
                  <div key={s.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-white/60">
                        <Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                        {s.label}
                      </span>
                      <span className="text-sm font-semibold text-white/40">
                        {s.value}
                        <span className="ml-1 text-xs text-white/20">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}60` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 0.6, 0.36, 1] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
