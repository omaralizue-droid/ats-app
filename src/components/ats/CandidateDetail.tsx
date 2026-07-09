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
}: {
  candidate: Candidate
  onStatusChange: (id: string, status: CandidateStatus) => void
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
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[rgba(0,240,255,0.06)] via-transparent to-[rgba(0,255,102,0.04)] p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[rgba(0,240,255,0.08)] blur-3xl"
        />
        <SheetHeader className="p-0">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-base font-bold text-[#00F0FF]"
              style={{
                background: 'rgba(0,240,255,0.08)',
                border: '1px solid rgba(0,240,255,0.3)',
                boxShadow: '0 0 18px rgba(0,240,255,0.2) inset',
              }}
            >
              {getInitials(candidate.name)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
                {candidate.name}
              </SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-col gap-0.5 text-xs">
                  {candidate.email && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3 w-3" /> {candidate.email}
                    </span>
                  )}
                  {candidate.latestRole && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Briefcase className="h-3 w-3" /> {candidate.latestRole}
                      {candidate.latestCompany ? ` · ${candidate.latestCompany}` : ''}
                    </span>
                  )}
                  {candidate.experienceYears != null && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3" /> {candidate.experienceYears} yr experience
                    </span>
                  )}
                  {candidate.linkedin && (
                    <a
                      href={candidate.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#00F0FF] hover:underline"
                    >
                      <Linkedin className="h-3 w-3" /> {candidate.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  )}
                </div>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Score + status actions */}
        <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ScoreBadge score={candidate.matchScore} size="lg" />
          <div className="flex w-full flex-1 flex-col gap-2 sm:w-auto">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Update status
            </span>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_BUTTONS.map((btn) => {
                const isActive = candidate.status === btn.value
                const Icon = btn.icon
                return (
                  <Button
                    key={btn.value}
                    type="button"
                    onClick={() => onStatusChange(candidate.id, btn.value)}
                    className={cn(
                      'h-9 gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-all',
                      isActive ? 'neon-glow-cyan' : 'bg-white/[0.03] text-muted-foreground',
                    )}
                    style={
                      isActive
                        ? {
                            color: btn.color,
                            background: btn.bg,
                            borderColor: btn.border,
                            boxShadow: `0 0 16px ${btn.color}40`,
                          }
                        : { borderColor: 'rgba(255,255,255,0.08)' }
                    }
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: isActive ? btn.color : undefined }} />
                    {btn.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="custom-scroll flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          {/* AI Verdict */}
          <Section title="AI Verdict" icon={<Sparkles className="h-4 w-4 text-[#00F0FF]" />}>
            <div
              className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30 p-4"
              style={{
                borderLeft: '3px solid #00F0FF',
                boxShadow: '0 0 18px rgba(0,240,255,0.08) inset',
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-5 items-center gap-1 rounded-md bg-[rgba(0,240,255,0.1)] px-1.5 text-[10px] font-bold uppercase tracking-wider text-[#00F0FF] neon-border-cyan">
                  <Sparkles className="h-3 w-3" />
                  AI
                </span>
                <span className="text-[11px] text-muted-foreground">Automated assessment</span>
                <VerdictPill verdict={candidate.verdict} />
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {candidate.briefSummary || 'No summary available.'}
              </p>
            </div>
          </Section>

          {/* Skills overview */}
          <Section title="Skills Overview" icon={<ShieldCheck className="h-4 w-4 text-[#00F0FF]" />}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Candidate skills (top_skills) */}
              <div className="rounded-xl border border-[rgba(0,255,102,0.2)] bg-[rgba(0,255,102,0.04)] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#00FF66]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#00FF66]">
                    Candidate Skills
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {topSkills.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topSkills.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground">No skills listed</span>
                  ) : (
                    topSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-[rgba(0,255,102,0.35)] bg-[rgba(0,255,102,0.08)] px-1.5 py-0.5 text-[11px] font-medium text-[#00FF66]"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
              {/* Missing / Gaps — MUST be neon red */}
              <div className="rounded-xl border border-[rgba(255,45,85,0.25)] bg-[rgba(255,45,85,0.04)] p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#FF2D55]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#FF2D55]">
                    Missing / Gaps
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {missingSkills.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground">No gaps detected</span>
                  ) : (
                    missingSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-[rgba(255,45,85,0.4)] bg-[rgba(255,45,85,0.1)] px-1.5 py-0.5 text-[11px] font-medium text-[#FF2D55]"
                        style={{ textShadow: '0 0 8px rgba(255,45,85,0.5)' }}
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
          <Section title="Key Strengths" icon={<Check className="h-4 w-4 text-[#00FF66]" />}>
            <BulletList
              items={candidate.keyStrengths}
              tone="green"
              emptyText="No strengths highlighted"
            />
          </Section>

          {/* Missing skills / Gaps detail */}
          <Section
            title="Gaps & Concerns"
            icon={<AlertTriangle className="h-4 w-4 text-[#FFB340]" />}
          >
            {candidate.missingSkills.length > 0 ? (
              <BulletList
                items={candidate.missingSkills}
                tone="red"
                emptyText="No notable gaps"
              />
            ) : (
              <div className="rounded-xl border border-[rgba(0,255,102,0.2)] bg-[rgba(0,255,102,0.04)] p-4 text-center text-xs text-[#00FF66]">
                No notable gaps — the candidate meets the JD requirements.
              </div>
            )}
          </Section>

          {/* Contact */}
          <Section title="Contact" icon={<Mail className="h-4 w-4 text-[#00F0FF]" />}>
            <div className="grid grid-cols-1 gap-2 rounded-xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2">
              <ContactRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={candidate.email ?? '—'} />
              <ContactRow
                icon={<Phone className="h-3.5 w-3.5" />}
                label="Phone"
                value={candidate.phone ?? '—'}
              />
              <ContactRow
                icon={<Linkedin className="h-3.5 w-3.5" />}
                label="LinkedIn"
                value={candidate.linkedin ?? '—'}
                href={candidate.linkedin ?? undefined}
              />
            </div>
          </Section>

          {/* Parsed metadata */}
          <Section
            title="Parsed Metadata"
            icon={<FileText className="h-4 w-4 text-[#00F0FF]" />}
          >
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/20 p-4">
              <MetaRow
                icon={<Briefcase className="h-3.5 w-3.5" />}
                label="Latest role"
                value={candidate.latestRole ?? '—'}
              />
              <MetaRow
                icon={<Building2 className="h-3.5 w-3.5" />}
                label="Company"
                value={candidate.latestCompany ?? '—'}
              />
              <MetaRow
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Experience"
                value={candidate.experienceYears != null ? `${candidate.experienceYears} years` : '—'}
              />
              <MetaRow
                icon={<Sparkles className="h-3.5 w-3.5" />}
                label="AI verdict"
                value={candidate.verdict}
              />
              <MetaRow
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Resume file"
                value={candidate.fileName}
                truncate
              />
              <MetaRow
                icon={<CalendarDays className="h-3.5 w-3.5" />}
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
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04]">
          {icon}
        </span>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
          {title}
        </h3>
        <Separator className="ml-2 flex-1 bg-white/5" />
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
  const color = tone === 'green' ? '#00FF66' : tone === 'red' ? '#FF2D55' : '#FFB340'
  const Icon = tone === 'green' ? Check : AlertTriangle
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center text-xs text-muted-foreground">
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
          className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] p-3"
        >
          <Icon
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color, filter: `drop-shadow(0 0 4px ${color}80)` }}
          />
          <span className="text-sm leading-relaxed text-foreground/90">{item}</span>
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
      <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-[#00F0FF] hover:underline" title={value}>
          {value}
        </a>
      ) : (
        <span className="truncate text-sm text-foreground" title={value}>
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
      <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className={cn('text-sm text-foreground', truncate && 'truncate')} title={value}>
        {value}
      </span>
    </div>
  )
}

export default CandidateDetail
