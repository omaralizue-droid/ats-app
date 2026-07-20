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
import { toast } from '@/hooks/use-toast'
import type { Candidate, CandidateStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
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
  ShieldCheck,
  Binary,
  Layers,
  Settings,
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
  
  // Custom stepper phase tracking
  const [analysisPhase, setAnalysisPhase] = useState(1)

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

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Stepper loop simulating steps for confidence building during processing
  useEffect(() => {
    if (!analyzing) {
      setAnalysisPhase(1)
      return
    }
    const t1 = setTimeout(() => setAnalysisPhase(2), 2200)
    const t2 = setTimeout(() => setAnalysisPhase(3), 5500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [analyzing])

  const handleFileUploaded = useCallback(async (data: { fileName: string; file: File }) => {
    if (jdText.trim().length < 60) {
      toast({ title: 'Job description required', description: 'Paste a JD before uploading.', variant: 'destructive' })
      return
    }
    setAnalyzing(true)
    setAnalysisPhase(1)
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
    dashboard: 'Candidate matching overview at a glance',
    upload: 'Stage candidate resumes against the target JD requirements',
    candidates: 'All candidate scores parsed from current workspace',
    analytics: 'Pipeline status distributions and score metrics',
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-[#f4f4f5]">
      <div className="flex flex-1">
        <Sidebar activeView={activeView} onNavigate={setActiveView} stats={stats} />

        {/* Main content grid */}
        <main className="custom-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8">

            {/* ── Page header ── */}
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-zinc-900 pb-5">
              <div>
                <div className="mb-1 flex items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
                    {viewTitle[activeView]}
                  </h1>
                  <span
                    className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500 font-mono"
                  >
                    AI Engine
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{viewSubtitle[activeView]}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadSampleJD}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-850 bg-zinc-900/50 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-900 hover:text-zinc-100"
                >
                  <Wand2 className="h-3.5 w-3.5 opacity-80" />
                  Load Sample JD
                </button>
                <button
                  onClick={fetchCandidates}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-850 bg-zinc-900/50 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-900 hover:text-zinc-100 disabled:opacity-40"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''} opacity-80`} />
                  Refresh
                </button>
              </div>
            </header>

            {/* ── View content ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
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
      <footer className="border-t border-zinc-900 bg-zinc-950/40">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-bold text-zinc-300">NeonATS</span>
            <span className="text-[11px] text-zinc-500">· Precise B2B Candidate Screening</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-650">
            <span className="hidden sm:inline">React · Next.js · Tailwind</span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Operational
            </span>
          </div>
        </div>
      </footer>

      {/* Candidate detail drawer */}
      <CandidateDetail
        candidate={selectedCandidate}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusChange={handleStatusChange}
      />

      {/* Stepper Processing Overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-col items-center gap-6 rounded-xl border border-zinc-900 bg-zinc-950 p-8 max-w-md w-full shadow-2xl"
            >
              {/* Stepper Step Visual */}
              <div className="flex items-center gap-3 w-full justify-center">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold font-mono transition-all",
                  analysisPhase === 1 ? "bg-blue-500/10 border-blue-500 text-blue-500" : "bg-zinc-900 border-zinc-800 text-zinc-550"
                )}>
                  {analysisPhase > 1 ? "✓" : "1"}
                </div>
                <div className="h-px bg-zinc-900 flex-1"></div>
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold font-mono transition-all",
                  analysisPhase === 2 ? "bg-blue-500/10 border-blue-500 text-blue-500" :
                  analysisPhase > 2 ? "bg-zinc-900 border-zinc-800 text-zinc-550" : "bg-zinc-950 border-zinc-900 text-zinc-700"
                )}>
                  {analysisPhase > 2 ? "✓" : "2"}
                </div>
                <div className="h-px bg-zinc-900 flex-1"></div>
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold font-mono transition-all",
                  analysisPhase === 3 ? "bg-blue-500/10 border-blue-500 text-blue-500" : "bg-zinc-950 border-zinc-900 text-zinc-700"
                )}>
                  3
                </div>
              </div>

              {/* Core messages */}
              <div className="text-center w-full">
                <AnimatePresence mode="wait">
                  {analysisPhase === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <Binary className="h-5 w-5 text-blue-500 animate-pulse" />
                      <p className="text-sm font-bold text-zinc-200">Extracting resume layers</p>
                      <p className="text-xs text-zinc-500">Reading structured blocks from file data</p>
                    </motion.div>
                  )}
                  {analysisPhase === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <Layers className="h-5 w-5 text-blue-500 animate-pulse" />
                      <p className="text-sm font-bold text-zinc-200">Evaluating rubric alignment</p>
                      <p className="text-xs text-zinc-500">Checking skills and direct experience match</p>
                    </motion.div>
                  )}
                  {analysisPhase === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <Settings className="h-5 w-5 text-blue-500 animate-spin" />
                      <p className="text-sm font-bold text-zinc-200">Scoring compatibility fit</p>
                      <p className="text-xs text-zinc-500">Weighted calculations & drafting AI summary</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Simulated small progress status */}
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                <motion.div
                  className="bg-blue-500 h-full rounded-full"
                  animate={{
                    width: analysisPhase === 1 ? '33%' : analysisPhase === 2 ? '66%' : '95%'
                  }}
                  transition={{ duration: 0.8 }}
                />
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
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500"
      >
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold tracking-tight text-zinc-200">{title}</h2>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
    </div>
  )
}

/* ── Thin divider ─────────────────────────────────────────────────────────── */
function Divider() {
  return <div className="my-6 h-px bg-zinc-900" />
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
    <div className="flex flex-col gap-6">
      <StatCards candidates={candidates} />
      <Divider />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionHeader
            icon={<Zap className="h-3.5 w-3.5" />}
            title="Upload Resume"
            subtitle="Drop candidate file to evaluate alignment"
          />
          <div className="mt-4">
            <UploadZone onFileUploaded={onFileUploaded} disabled={jdText.trim().length < 60} />
            {jdText.trim().length < 60 && (
              <p className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-500/90 font-medium">
                <FileSearch className="h-3.5 w-3.5" />
                Paste the Job Description to enable resume staging
              </p>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <SectionHeader
            icon={<FileSearch className="h-3.5 w-3.5" />}
            title="Job Description"
            subtitle="Paste target role requirements here"
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
            title="Top Matches"
            subtitle="Candidates ranked by technical compatibility"
          />
          {candidates.length > 0 && (
            <button
              onClick={() => onNavigate('candidates')}
              className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              View all candidates
              <ArrowUpRight className="h-3.5 w-3.5" />
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
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-500/90 font-medium">
              <FileSearch className="h-3.5 w-3.5" />
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
    <div className="flex flex-col gap-6">
      <StatCards candidates={candidates} />
      <Divider />
      <div>
        <SectionHeader
          icon={<Users className="h-3.5 w-3.5" />}
          title="All Candidates"
          subtitle={`${candidates.length} total candidates in workspace`}
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
      { label: '90–100', min: 90, max: 100, color: '#10b981' },
      { label: '75–89',  min: 75, max: 89,  color: '#3b82f6' },
      { label: '50–74',  min: 50, max: 74,  color: '#f59e0b' },
      { label: '0–49',   min: 0,  max: 49,  color: '#ef4444' },
    ]
    return bands.map(b => ({
      ...b,
      count: candidates.filter(c => c.matchScore >= b.min && c.matchScore <= b.max).length,
    }))
  }, [candidates])

  const maxCount = Math.max(1, ...scoreBands.map(b => b.count))

  const statusBreakdown = [
    { label: 'Shortlisted', value: stats.shortlisted, color: '#10b981', icon: ThumbsUp },
    { label: 'Review',      value: stats.review,      color: '#f59e0b', icon: Clock    },
    { label: 'Rejected',    value: stats.rejected,    color: '#ef4444', icon: XCircle  },
  ]

  const emptyState = (text: string) => (
    <p className="py-10 text-center text-xs text-zinc-550">{text}</p>
  )

  return (
    <div className="flex flex-col gap-6 font-mono">
      <StatCards candidates={candidates} />
      <Divider />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Score distribution */}
        <div
          className="rounded-xl p-6 bg-zinc-950 border border-zinc-900"
        >
          <div className="mb-5 flex items-center gap-2.5">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Score Distribution
            </h3>
          </div>
          {candidates.length === 0 ? emptyState('Upload resumes to see score distribution.') : (
            <div className="flex flex-col gap-3">
              {scoreBands.map(band => (
                <div key={band.label} className="flex items-center gap-3">
                  <span className="w-14 text-xs font-semibold text-zinc-500">{band.label}</span>
                  <div className="relative h-6 flex-1 overflow-hidden rounded bg-zinc-900/60 border border-zinc-900">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-l"
                      style={{
                        backgroundColor: `${band.color}20`,
                        borderRight: `2.5px solid ${band.color}`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(band.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 0.6, 0.36, 1] }}
                    />
                    <span className="absolute inset-y-0 left-2.5 flex items-center text-xs font-bold" style={{ color: band.color }}>
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
          className="rounded-xl p-6 bg-zinc-950 border border-zinc-900"
        >
          <div className="mb-5 flex items-center gap-2.5">
            <Gauge className="h-4 w-4 text-emerald-555" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
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
                      <span className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                        <Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                        {s.label}
                      </span>
                      <span className="text-xs font-bold text-zinc-400">
                        {s.value}
                        <span className="ml-1 text-[10px] text-zinc-600">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded bg-zinc-900">
                      <motion.div
                        className="h-full rounded"
                        style={{ backgroundColor: s.color }}
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
