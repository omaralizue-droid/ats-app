'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Check,
  AlertTriangle,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  Clock,
  FileText,
  CalendarDays,
  ShieldCheck,
  XCircle,
  ThumbsUp,
  Building2,
  Trash2,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScoreBadge } from './ScoreBadge'
import { cn } from '@/lib/utils'
import type { Candidate, CandidateStatus } from '@/lib/types'

export interface CandidateDetailProps {
  candidate: Candidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
  onDeleteCandidate?: (id: string, name: string) => void
}

const STATUS_BUTTONS: {
  value: CandidateStatus
  label: string
  color: string
  bg: string
  border: string
  icon: typeof ThumbsUp
}[] = [
  {
    value: 'SHORTLIST',
    label: 'Shortlist',
    color: '#00FF66',
    bg: 'rgba(0,255,102,0.1)',
    border: 'rgba(0,255,102,0.5)',
    icon: ThumbsUp,
  },
  {
    value: 'REVIEW',
    label: 'Review',
    color: '#FFB340',
    bg: 'rgba(255,179,64,0.1)',
    border: 'rgba(255,179,64,0.5)',
    icon: Clock,
  },
  {
    value: 'REJECT',
    label: 'Reject',
    color: '#FF2D55',
    bg: 'rgba(255,45,85,0.1)',
    border: 'rgba(255,45,85,0.5)',
    icon: XCircle,
  },
]

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function VerdictPill({ verdict }: { verdict: string }) {
  const v = (verdict ?? '').toLowerCase()
  let color = '#FFB340'
  let bg = 'rgba(255,179,64,0.12)'
  let border = 'rgba(255,179,64,0.4)'
  if (v.includes('shortlist') || v.includes('strong')) {
    color = '#00FF66'
    bg = 'rgba(0,255,102,0.12)'
    border = 'rgba(0,255,102,0.4)'
  } else if (v.includes('reject')) {
    color = '#FF2D55'
    bg = 'rgba(255,45,85,0.12)'
    border = 'rgba(255,45,85,0.4)'
  }
  return (
    <span
      className="ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      <ShieldCheck className="h-3 w-3" style={{ color }} />
      {verdict}
    </span>
  )
}

export function CandidateDetail({
  candidate,
  open,
  onOpenChange,
  onStatusChange,
}: CandidateDetailProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="custom-scroll w-full overflow-y-auto border-l border-white/10 bg-[#0B1019]/95 p-0 backdrop-blur-xl sm:max-w-[540px]"
      >
        <AnimatePresence mode="wait">
          {candidate && (
            <CandidateDetailBody
              key={candidate.id}
              candidate={candidate}
              onStatusChange={onStatusChange}
              onDeleteCandidate={onDeleteCandidate}
            />
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}

function CandidateDetailBody({
  candidate,
  onStatusChange,
  onDeleteCandidate,
}: {
  candidate: Candidate
  onStatusChange: (id: string, status: CandidateStatus) => void
  onDeleteCandidate?: (id: string, name: string) => void
}) {
  const topSkills = useMemo(() => candidate.topSkills ?? [], [candidate.topSkills])
  const missingSkills = useMemo(() => candidate.missingSkills ?? [], [candidate.missingSkills])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col"
    >
      {/* Header — score + identity */}
      <div className="relative overflow-hidden border-b border-white/[0.03] bg-zinc-950/50 p-6 backdrop-blur-xl">
        <SheetHeader className="p-0">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 shadow-inner"
            >
              {getInitials(candidate.name)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <SheetTitle className="text-base font-bold tracking-tight text-white font-mono uppercase">
                {candidate.name}
              </SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-col gap-0.5 text-[10px] font-mono">
                  {candidate.email && (
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <Mail className="h-3.5 w-3.5 opacity-40" /> {candidate.email}
                    </span>
                  )}
                  {candidate.latestRole && (
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Briefcase className="h-3.5 w-3.5 opacity-40" /> {candidate.latestRole}
                      {candidate.latestCompany ? ` · ${candidate.latestCompany}` : ''}
                    </span>
                  )}
                  {candidate.experienceYears != null && (
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Clock className="h-3.5 w-3.5 opacity-40" /> {candidate.experienceYears} yr experience
                    </span>
                  )}
                  {candidate.linkedin && (
                    <a
                      href={candidate.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-400 hover:underline font-bold"
                    >
                      <Linkedin className="h-3.5 w-3.5 opacity-60" /> {candidate.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  )}
                </div>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Score + status actions */}
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between font-mono">
          <ScoreBadge score={candidate.matchScore} size="lg" />
          <div className="flex w-full flex-1 flex-col gap-2 sm:w-auto">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              Ingestion Status
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {STATUS_BUTTONS.map((btn) => {
                const isActive = candidate.status === btn.value
                const Icon = btn.icon
                return (
                  <Button
                    key={btn.value}
                    type="button"
                    onClick={() => onStatusChange(candidate.id, btn.value)}
                    className={cn(
                      'h-8 gap-1 rounded text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer',
                      isActive ? 'text-white' : 'bg-white/[0.01] border-white/[0.03] text-zinc-400 hover:bg-white/[0.03] hover:text-white',
                    )}
                    style={
                      isActive
                        ? {
                            color: btn.color,
                            background: btn.bg,
                            borderColor: btn.border,
                          }
                        : {}
                    }
                  >
                    <Icon className="h-3 w-3" />
                    {btn.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {onDeleteCandidate && (
          <div className="mt-4 pt-3 border-t border-white/[0.04] flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDeleteCandidate(candidate.id, candidate.name)}
              className="h-8 gap-1.5 border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 text-[10px] uppercase font-mono tracking-wider font-bold transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Candidate Profile
            </Button>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="custom-scroll flex-1 overflow-y-auto p-6 bg-zinc-950/20">
        <div className="flex flex-col gap-6">
          {/* AI Verdict */}
          <Section title="AI Verdict" icon={<Sparkles className="h-4 w-4 text-blue-400" />}>
            <div
              className="relative overflow-hidden rounded-lg border border-white/[0.04] bg-white/[0.01] p-4 border-l-2 border-l-[#00f0ff] shadow-inner"
            >
              <div className="mb-2.5 flex items-center gap-2 font-mono">
                <span className="flex h-5 items-center gap-1 rounded bg-[#00f0ff]/10 px-1.5 text-[8px] font-bold uppercase tracking-wider text-[#00f0ff] border border-[#00f0ff]/20">
                  <Sparkles className="h-3 w-3" />
                  AI
                </span>
                <span className="text-[10px] text-zinc-500">Assessment Node</span>
                <VerdictPill verdict={candidate.verdict} />
              </div>
              <p className="text-xs leading-relaxed text-zinc-300">
                {candidate.briefSummary || 'No summary available.'}
              </p>
            </div>
          </Section>

          {/* Skills overview */}
          <Section title="Skills Alignment" icon={<ShieldCheck className="h-4 w-4 text-blue-400" />}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 font-mono">
              {/* Candidate skills */}
              <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3.5">
                <div className="mb-2.5 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                    Matched Stack
                  </span>
                  <span className="ml-auto text-[9px] text-zinc-650">
                    {topSkills.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {topSkills.length === 0 ? (
                    <span className="text-[9px] text-zinc-500">No skills listed</span>
                  ) : (
                    topSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
              {/* Missing / Gaps */}
              <div className="rounded-lg border border-red-500/10 bg-red-500/5 p-3.5">
                <div className="mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">
                    Gaps Detected
                  </span>
                  <span className="ml-auto text-[9px] text-zinc-650">
                    {missingSkills.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {missingSkills.length === 0 ? (
                    <span className="text-[9px] text-zinc-500">No gaps detected</span>
                  ) : (
                    missingSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-400 border border-red-500/20"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* Key strengths */}
          <Section title="Key Strengths" icon={<Check className="h-4 w-4 text-emerald-400" />}>
            <BulletList
              items={candidate.keyStrengths}
              tone="green"
              emptyText="No strengths highlighted"
            />
          </Section>

          {/* Missing skills / Gaps detail */}
          <Section
            title="Gaps & Concerns"
            icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
          >
            {candidate.missingSkills.length > 0 ? (
              <BulletList
                items={candidate.missingSkills}
                tone="red"
                emptyText="No notable gaps"
              />
            ) : (
              <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-4 text-center text-xs text-emerald-400 font-mono uppercase tracking-wider">
                No notable gaps — profile meets JD spec.
              </div>
            )}
          </Section>

          {/* Contact */}
          <Section title="Contact" icon={<Mail className="h-4 w-4 text-blue-400" />}>
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-white/[0.04] bg-white/[0.01] p-4 sm:grid-cols-2">
              <ContactRow icon={<Mail className="h-3.5 w-3.5 text-zinc-500" />} label="Email" value={candidate.email ?? '—'} />
              <ContactRow
                icon={<Phone className="h-3.5 w-3.5 text-zinc-500" />}
                label="Phone"
                value={candidate.phone ?? '—'}
              />
              <ContactRow
                icon={<Linkedin className="h-3.5 w-3.5 text-zinc-500" />}
                label="LinkedIn"
                value={candidate.linkedin ?? '—'}
                href={candidate.linkedin ?? undefined}
              />
            </div>
          </Section>

          {/* Parsed metadata */}
          <Section
            title="Parsed Metadata"
            icon={<FileText className="h-4 w-4 text-blue-400" />}
          >
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/[0.04] bg-white/[0.01] p-4">
              <MetaRow
                icon={<Briefcase className="h-3.5 w-3.5 text-zinc-500" />}
                label="Latest role"
                value={candidate.latestRole ?? '—'}
              />
              <MetaRow
                icon={<Building2 className="h-3.5 w-3.5 text-zinc-500" />}
                label="Company"
                value={candidate.latestCompany ?? '—'}
              />
              <MetaRow
                icon={<Clock className="h-3.5 w-3.5 text-zinc-500" />}
                label="Experience"
                value={candidate.experienceYears != null ? `${candidate.experienceYears} years` : '—'}
              />
              <MetaRow
                icon={<Sparkles className="h-3.5 w-3.5 text-zinc-500" />}
                label="AI verdict"
                value={candidate.verdict}
              />
              <MetaRow
                icon={<FileText className="h-3.5 w-3.5 text-zinc-500" />}
                label="Resume file"
                value={candidate.fileName}
                truncate
              />
              <MetaRow
                icon={<CalendarDays className="h-3.5 w-3.5 text-zinc-500" />}
                label="Uploaded"
                value={formatDate(candidate.createdAt)}
                truncate
              />
            </div>
          </Section>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.01] border border-white/[0.03]">
          {icon}
        </span>
        <h3 className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
          {title}
        </h3>
        <Separator className="ml-2 flex-1 bg-white/[0.03]" />
      </div>
      {children}
    </motion.section>
  )
}

function BulletList({
  items,
  tone,
  emptyText,
}: {
  items: string[]
  tone: 'green' | 'amber' | 'red'
  emptyText: string
}) {
  const color = tone === 'green' ? '#10b981' : tone === 'red' ? '#ef4444' : '#f59e0b'
  const Icon = tone === 'green' ? Check : AlertTriangle
  const listBorderClass = tone === 'green' ? 'border-emerald-500/10 bg-emerald-500/5' : tone === 'red' ? 'border-red-500/10 bg-red-500/5' : 'border-amber-500/10 bg-amber-500/5'

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-900 bg-zinc-900/5 p-4 text-center text-xs text-zinc-500">
        {emptyText}
      </div>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, idx) => (
        <motion.li
          key={`${item}-${idx}`}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.3) }}
          className={cn("flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-relaxed", listBorderClass)}
        >
          <Icon
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color }}
          />
          <span className="text-zinc-300">{item}</span>
        </motion.li>
      ))}
    </ul>
  )
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
        {icon}
        {label}
      </span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-blue-500 hover:underline font-semibold" title={value}>
          {value}
        </a>
      ) : (
        <span className="truncate text-xs text-zinc-300 font-semibold" title={value}>
          {value}
        </span>
      )}
    </div>
  )
}

function MetaRow({
  icon,
  label,
  value,
  truncate,
}: {
  icon: React.ReactNode
  label: string
  value: string
  truncate?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
        {icon}
        {label}
      </span>
      <span className={cn('text-xs text-zinc-300 font-semibold', truncate && 'truncate')} title={value}>
        {value}
      </span>
    </div>
  )
}

export default CandidateDetail
