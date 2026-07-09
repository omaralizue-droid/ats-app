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
  Loader2,
  Zap,
  FileSearch,
  Wand2,
  TrendingUp,
  Users,
  Gauge,
  ThumbsUp,
  Clock,
  XCircle,
} from 'lucide-react'

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

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jdText, setJdText] = useState('')
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  )
  const [detailOpen, setDetailOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  // ---- Data fetching ----
  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/candidates')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCandidates(data.candidates || [])
    } catch {
      toast({
        title: 'Connection error',
        description: 'Could not load candidates. Retrying…',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // ---- Handlers ----
  const handleFileUploaded = useCallback(
    async (data: { fileName: string; resumeText: string }) => {
      if (jdText.trim().length < 60) {
        toast({
          title: 'Job description required',
          description:
            'Paste a target job description (at least a few sentences) before uploading a resume.',
          variant: 'destructive',
        })
        return
      }

      setAnalyzing(true)
      try {
        // Step 1 — AI analysis
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: data.resumeText,
            jobDescription: jdText,
            fileName: data.fileName,
          }),
        })
        if (!analyzeRes.ok) {
          const err = await analyzeRes.json().catch(() => ({}))
          throw new Error(err.error || 'AI analysis failed.')
        }
        const { result } = await analyzeRes.json()

        // Step 2 — persist candidate
        const createRes = await fetch('/api/candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...result,
            fileName: data.fileName,
            jdText,
            rawText: data.resumeText,
          }),
        })
        if (!createRes.ok) {
          const err = await createRes.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to save candidate.')
        }
        const { candidate } = await createRes.json()

        setCandidates((prev) =>
          [candidate, ...prev].sort((a, b) => b.matchScore - a.matchScore),
        )
        toast({
          title: 'Resume analyzed',
          description: `${candidate.name} scored ${candidate.matchScore}% — ${candidate.status.toLowerCase()}.`,
        })
      } catch (err) {
        toast({
          title: 'Analysis failed',
          description:
            err instanceof Error ? err.message : 'Unexpected error occurred.',
          variant: 'destructive',
        })
      } finally {
        setAnalyzing(false)
      }
    },
    [jdText],
  )

  const handleStatusChange = useCallback(
    async (id: string, status: CandidateStatus) => {
      // Optimistic update
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c)),
      )
      setSelectedCandidate((prev) =>
        prev && prev.id === id ? { ...prev, status } : prev,
      )
      try {
        const res = await fetch(`/api/candidates/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        if (!res.ok) throw new Error('Failed to update status.')
        const { candidate } = await res.json()
        setCandidates((prev) =>
          prev.map((c) => (c.id === id ? candidate : c)),
        )
        setSelectedCandidate((prev) =>
          prev && prev.id === id ? candidate : prev,
        )
      } catch {
        toast({
          title: 'Update failed',
          description: 'Could not update status. Reverting.',
          variant: 'destructive',
        })
        fetchCandidates()
      }
    },
    [fetchCandidates],
  )

  const handleSelectCandidate = useCallback((c: Candidate) => {
    setSelectedCandidate(c)
    setDetailOpen(true)
  }, [])

  const handleLoadSampleJD = useCallback(() => {
    setJdText(SAMPLE_JD)
    toast({
      title: 'Sample JD loaded',
      description: 'A Senior Frontend Engineer job description is ready.',
    })
  }, [])

  // ---- Derived stats ----
  const stats: SidebarStats = useMemo(
    () => ({
      total: candidates.length,
      shortlisted: candidates.filter((c) => c.status === 'SHORTLIST').length,
      review: candidates.filter((c) => c.status === 'REVIEW').length,
      rejected: candidates.filter((c) => c.status === 'REJECT').length,
      avgScore: candidates.length
        ? Math.round(
            candidates.reduce((s, c) => s + c.matchScore, 0) /
              candidates.length,
          )
        : 0,
    }),
    [candidates],
  )

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
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          stats={stats}
        />

        {/* Main content */}
        <main className="custom-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {viewTitle[activeView]}
                  </h1>
                  <span className="rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.08)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider neon-text-cyan">
                    AI
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {viewSubtitle[activeView]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSampleJD}
                  className="border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                >
                  <Wand2 className="h-4 w-4" />
                  Load sample JD
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchCandidates}
                  disabled={loading}
                  className="border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
              </div>
            </header>

            {/* View content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
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
                  <UploadView
                    jdText={jdText}
                    onJdChange={setJdText}
                    onFileUploaded={handleFileUploaded}
                  />
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

      {/* Sticky footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#0b1019]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#00F0FF]" />
            <span>
              <span className="gradient-text-cyan font-semibold">NeonATS</span>{' '}
              · AI-powered resume screening
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">
              Built with Next.js · Tailwind · z-ai SDK
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
              All systems operational
            </span>
          </div>
        </div>
      </footer>

      {/* Candidate detail sheet */}
      <CandidateDetail
        candidate={selectedCandidate}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusChange={handleStatusChange}
      />

      {/* Analyzing overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#090d16]/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong flex flex-col items-center gap-5 rounded-2xl px-10 py-8 neon-border-cyan"
            >
              <div className="relative flex h-20 w-20 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#00F0FF]/30 border-t-[#00F0FF]"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ boxShadow: '0 0 20px rgba(0,240,255,0.4)' }}
                />
                <Sparkles className="h-8 w-8 text-[#00F0FF]" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold neon-text-cyan">
                  AI is analyzing…
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Parsing resume · matching skills · scoring fit
                </p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[#00F0FF]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
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

/* -------------------------------------------------------------------------- */
/* View: Dashboard                                                            */
/* -------------------------------------------------------------------------- */

function DashboardView({
  candidates,
  loading,
  jdText,
  onJdChange,
  onFileUploaded,
  onSelectCandidate,
  onStatusChange,
  onNavigate,
}: {
  candidates: Candidate[]
  loading: boolean
  jdText: string
  onJdChange: (v: string) => void
  onFileUploaded: (data: { fileName: string; resumeText: string }) => void
  onSelectCandidate: (c: Candidate) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
  onNavigate: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <StatCards candidates={candidates} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionHeader
            icon={<Zap className="h-4 w-4" />}
            title="Upload Resume"
            subtitle="Drop a file to run AI matching"
          />
          <div className="mt-3">
            <UploadZone
              onFileUploaded={onFileUploaded}
              disabled={jdText.trim().length < 60}
            />
            {jdText.trim().length < 60 && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-[#FFB340]">
                <FileSearch className="h-3.5 w-3.5" />
                Paste a job description below to enable uploads
              </p>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <SectionHeader
            icon={<FileSearch className="h-4 w-4" />}
            title="Job Description"
            subtitle="The target role to match against"
          />
          <div className="mt-3">
            <JobDescriptionInput value={jdText} onChange={onJdChange} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <SectionHeader
            icon={<Users className="h-4 w-4" />}
            title="Top Candidates"
            subtitle="Ranked by AI match score"
          />
          {candidates.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('candidates')}
              className="text-muted-foreground hover:text-[#00F0FF]"
            >
              View all
            </Button>
          )}
        </div>
        <div className="mt-3">
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

/* -------------------------------------------------------------------------- */
/* View: Upload                                                               */
/* -------------------------------------------------------------------------- */

function UploadView({
  jdText,
  onJdChange,
  onFileUploaded,
}: {
  jdText: string
  onJdChange: (v: string) => void
  onFileUploaded: (data: { fileName: string; resumeText: string }) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <SectionHeader
          icon={<Zap className="h-4 w-4" />}
          title="Resume Upload"
          subtitle="PDF, DOC, DOCX, or TXT — up to 10MB"
        />
        <div className="mt-3">
          <UploadZone
            onFileUploaded={onFileUploaded}
            disabled={jdText.trim().length < 60}
          />
          {jdText.trim().length < 60 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[#FFB340]">
              <FileSearch className="h-3.5 w-3.5" />
              A job description is required before uploading
            </p>
          )}
        </div>
      </div>
      <div>
        <SectionHeader
          icon={<FileSearch className="h-4 w-4" />}
          title="Target Job Description"
          subtitle="Paste the role requirements here"
        />
        <div className="mt-3">
          <JobDescriptionInput value={jdText} onChange={onJdChange} />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* View: Candidates                                                           */
/* -------------------------------------------------------------------------- */

function CandidatesView({
  candidates,
  loading,
  onSelectCandidate,
  onStatusChange,
}: {
  candidates: Candidate[]
  loading: boolean
  onSelectCandidate: (c: Candidate) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <StatCards candidates={candidates} />
      <div>
        <SectionHeader
          icon={<Users className="h-4 w-4" />}
          title="All Candidates"
          subtitle={`${candidates.length} total · sorted by match score`}
        />
        <div className="mt-3">
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

/* -------------------------------------------------------------------------- */
/* View: Analytics                                                            */
/* -------------------------------------------------------------------------- */

function AnalyticsView({
  candidates,
  stats,
}: {
  candidates: Candidate[]
  stats: SidebarStats
}) {
  const scoreBands = useMemo(() => {
    const bands = [
      { label: '90-100', min: 90, max: 100, color: '#00FF66' },
      { label: '75-89', min: 75, max: 89, color: '#00F0FF' },
      { label: '50-74', min: 50, max: 74, color: '#FFB340' },
      { label: '0-49', min: 0, max: 49, color: '#FF2D55' },
    ]
    return bands.map((b) => ({
      ...b,
      count: candidates.filter((c) => c.matchScore >= b.min && c.matchScore <= b.max)
        .length,
    }))
  }, [candidates])

  const maxCount = Math.max(1, ...scoreBands.map((b) => b.count))

  const statusBreakdown = [
    { label: 'Shortlisted', value: stats.shortlisted, color: '#00FF66', icon: ThumbsUp },
    { label: 'Review', value: stats.review, color: '#FFB340', icon: Clock },
    { label: 'Rejected', value: stats.rejected, color: '#FF2D55', icon: XCircle },
  ]

  return (
    <div className="flex flex-col gap-6">
      <StatCards candidates={candidates} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Score distribution */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#00F0FF]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Score Distribution
            </h3>
          </div>
          {candidates.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No data yet. Upload resumes to see distribution.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {scoreBands.map((band) => (
                <div key={band.label} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-medium text-muted-foreground">
                    {band.label}
                  </span>
                  <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-white/[0.03]">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-lg"
                      style={{
                        backgroundColor: `${band.color}25`,
                        boxShadow: `inset 0 0 12px ${band.color}40`,
                        borderRight: `2px solid ${band.color}`,
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(band.count / maxCount) * 100}%`,
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                    <span
                      className="absolute inset-y-0 left-3 flex items-center text-sm font-bold"
                      style={{ color: band.color }}
                    >
                      {band.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-[#00FF66]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Pipeline Status
            </h3>
          </div>
          {candidates.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No candidates in the pipeline yet.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {statusBreakdown.map((s) => {
                const pct =
                  stats.total > 0
                    ? Math.round((s.value / stats.total) * 100)
                    : 0
                const Icon = s.icon
                return (
                  <div key={s.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Icon className="h-4 w-4" style={{ color: s.color }} />
                        {s.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {s.value}{' '}
                        <span className="text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: s.color,
                          boxShadow: `0 0 10px ${s.color}80`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
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

/* -------------------------------------------------------------------------- */
/* Shared: Section header                                                     */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.06)] text-[#00F0FF]">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}
