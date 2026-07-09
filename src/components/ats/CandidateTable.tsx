'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Eye,
  Inbox,
  Mail,
  Briefcase,
  Clock,
  ThumbsUp,
  XCircle,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ScoreBadge } from './ScoreBadge'
import { cn } from '@/lib/utils'
import type { Candidate, CandidateStatus } from '@/lib/types'

export interface CandidateTableProps {
  candidates: Candidate[]
  loading?: boolean
  onSelectCandidate: (c: Candidate) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
  className?: string
}

const STATUS_META: Record<
  CandidateStatus,
  { label: string; color: string; bg: string; border: string; icon: typeof Clock }
> = {
  REVIEW: {
    label: 'Review',
    color: '#FFB340',
    bg: 'rgba(255,179,64,0.12)',
    border: 'rgba(255,179,64,0.4)',
    icon: Clock,
  },
  SHORTLIST: {
    label: 'Shortlist',
    color: '#00FF66',
    bg: 'rgba(0,255,102,0.12)',
    border: 'rgba(0,255,102,0.4)',
    icon: ThumbsUp,
  },
  REJECT: {
    label: 'Reject',
    color: '#FF2D55',
    bg: 'rgba(255,45,85,0.12)',
    border: 'rgba(255,45,85,0.4)',
    icon: XCircle,
  },
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const STATUS_OPTIONS: CandidateStatus[] = ['REVIEW', 'SHORTLIST', 'REJECT']

export function CandidateTable({
  candidates,
  loading = false,
  onSelectCandidate,
  onStatusChange,
  className,
}: CandidateTableProps) {
  // Sort by matchScore desc (defensive — backend already sorts, but keep it stable here too)
  const sorted = useMemo(
    () => [...candidates].sort((a, b) => b.matchScore - a.matchScore),
    [candidates],
  )

  if (loading) {
    return <TableSkeleton className={className} />
  }

  if (sorted.length === 0) {
    return <EmptyState className={className} />
  }

  return (
    <div className={cn('glass w-full overflow-hidden rounded-2xl', className)}>
      {/* Desktop / tablet: full table */}
      <div className="hidden md:block">
        <div className="custom-scroll overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Candidate
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Match
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Skills
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {sorted.map((c, idx) => (
                  <CandidateRow
                    key={c.id}
                    candidate={c}
                    index={idx}
                    onSelectCandidate={onSelectCandidate}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 p-3 md:hidden">
        <AnimatePresence initial={false}>
          {sorted.map((c, idx) => (
            <CandidateCardMobile
              key={c.id}
              candidate={c}
              index={idx}
              onSelectCandidate={onSelectCandidate}
              onStatusChange={onStatusChange}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Desktop row
// ---------------------------------------------------------------------------

function CandidateRow({
  candidate,
  index,
  onSelectCandidate,
  onStatusChange,
}: {
  candidate: Candidate
  index: number
  onSelectCandidate: (c: Candidate) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
}) {
  const meta = STATUS_META[candidate.status]
  const StatusIcon = meta.icon
  const visibleSkills = candidate.skills.slice(0, 4)
  const extraCount = candidate.skills.length - visibleSkills.length

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className={cn(
        'group relative border-b border-white/5 transition-colors',
        'hover:bg-white/[0.04]',
      )}
    >
      {/* Left neon accent on hover */}
      <td className="relative p-0">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-[#00F0FF] transition-transform duration-200 group-hover:scale-y-100"
          style={{ boxShadow: '0 0 12px rgba(0,240,255,0.7)' }}
        />
      </td>

      <TableCell className="px-4 py-3.5">
        <button
          onClick={() => onSelectCandidate(candidate)}
          className="flex items-center gap-3 text-left"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#00F0FF]"
            style={{
              background: 'rgba(0,240,255,0.08)',
              border: '1px solid rgba(0,240,255,0.3)',
              boxShadow: '0 0 12px rgba(0,240,255,0.15) inset',
            }}
          >
            {getInitials(candidate.name)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground group-hover:text-[#00F0FF] transition-colors">
              {candidate.name}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="max-w-[200px] truncate">{candidate.email}</span>
            </span>
            {candidate.currentRole && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                <Briefcase className="h-3 w-3" />
                <span className="max-w-[200px] truncate">{candidate.currentRole}</span>
              </span>
            )}
          </div>
        </button>
      </TableCell>

      <TableCell className="px-4 py-3.5">
        <ScoreBadge score={candidate.matchScore} size="sm" animateCount={false} />
      </TableCell>

      <TableCell className="px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-1.5 max-w-[280px]">
          {visibleSkills.map((s) => (
            <span
              key={s}
              className="rounded-md border border-[rgba(0,240,255,0.25)] bg-[rgba(0,240,255,0.06)] px-1.5 py-0.5 text-[10px] font-medium text-[#00F0FF]"
            >
              {s}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{extraCount} more
            </span>
          )}
          {candidate.skills.length === 0 && (
            <span className="text-[11px] text-muted-foreground">No skills</span>
          )}
        </div>
      </TableCell>

      <TableCell className="px-4 py-3.5">
        <StatusDropdown
          status={candidate.status}
          onChange={(s) => onStatusChange(candidate.id, s)}
        />
      </TableCell>

      <TableCell className="px-4 py-3.5 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectCandidate(candidate)}
          className="gap-1.5 border border-white/10 bg-white/[0.03] text-foreground hover:border-[rgba(0,240,255,0.4)] hover:bg-[rgba(0,240,255,0.08)] hover:text-[#00F0FF]"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
      </TableCell>
    </motion.tr>
  )
}

// ---------------------------------------------------------------------------
// Mobile card
// ---------------------------------------------------------------------------

function CandidateCardMobile({
  candidate,
  index,
  onSelectCandidate,
  onStatusChange,
}: {
  candidate: Candidate
  index: number
  onSelectCandidate: (c: Candidate) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
}) {
  const visibleSkills = candidate.skills.slice(0, 4)
  const extraCount = candidate.skills.length - visibleSkills.length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onSelectCandidate(candidate)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#00F0FF]"
            style={{
              background: 'rgba(0,240,255,0.08)',
              border: '1px solid rgba(0,240,255,0.3)',
            }}
          >
            {getInitials(candidate.name)}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">
              {candidate.name}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">{candidate.email}</span>
            {candidate.currentRole && (
              <span className="truncate text-[11px] text-muted-foreground/80">
                {candidate.currentRole}
              </span>
            )}
          </div>
        </button>
        <ScoreBadge score={candidate.matchScore} size="sm" animateCount={false} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {visibleSkills.map((s) => (
          <span
            key={s}
            className="rounded-md border border-[rgba(0,240,255,0.25)] bg-[rgba(0,240,255,0.06)] px-1.5 py-0.5 text-[10px] font-medium text-[#00F0FF]"
          >
            {s}
          </span>
        ))}
        {extraCount > 0 && (
          <span className="rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            +{extraCount} more
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusDropdown
          status={candidate.status}
          onChange={(s) => onStatusChange(candidate.id, s)}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectCandidate(candidate)}
          className="gap-1.5 border border-white/10 bg-white/[0.03] text-foreground hover:border-[rgba(0,240,255,0.4)] hover:bg-[rgba(0,240,255,0.08)] hover:text-[#00F0FF]"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Status dropdown pill
// ---------------------------------------------------------------------------

function StatusDropdown({
  status,
  onChange,
}: {
  status: CandidateStatus
  onChange: (s: CandidateStatus) => void
}) {
  const meta = STATUS_META[status]
  const StatusIcon = meta.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all hover:brightness-125"
          style={{
            color: meta.color,
            background: meta.bg,
            borderColor: meta.border,
          }}
        >
          <StatusIcon className="h-3 w-3" style={{ color: meta.color }} />
          {meta.label}
          <ChevronDown className="h-3 w-3 opacity-60 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[160px] border-white/10 bg-[#0F1422]/95 backdrop-blur-md"
      >
        <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Change status
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        {STATUS_OPTIONS.map((opt) => {
          const m = STATUS_META[opt]
          const Icon = m.icon
          const isActive = opt === status
          return (
            <DropdownMenuItem
              key={opt}
              onClick={() => onChange(opt)}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                isActive && 'bg-white/[0.04]',
              )}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
              <span style={{ color: isActive ? m.color : undefined }} className="font-medium">
                {m.label}
              </span>
              {isActive && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
                />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ---------------------------------------------------------------------------
// Skeleton loading
// ---------------------------------------------------------------------------

function TableSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glass w-full overflow-hidden rounded-2xl', className)}>
      <div className="hidden md:block">
        <div className="border-b border-white/5 px-4 py-3">
          <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr] gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer-bg h-3.5 w-3/4 rounded" />
            ))}
          </div>
        </div>
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="border-b border-white/5 px-4 py-4">
            <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr] items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="shimmer-bg h-10 w-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="shimmer-bg h-3 w-2/3 rounded" />
                  <div className="shimmer-bg h-2.5 w-1/2 rounded" />
                </div>
              </div>
              <div className="shimmer-bg h-10 w-10 rounded-full" />
              <div className="flex gap-1.5">
                <div className="shimmer-bg h-4 w-12 rounded" />
                <div className="shimmer-bg h-4 w-14 rounded" />
                <div className="shimmer-bg h-4 w-10 rounded" />
              </div>
              <div className="shimmer-bg h-5 w-20 rounded-full" />
              <div className="shimmer-bg ml-auto h-7 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 p-3 md:hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
            <div className="flex items-center gap-3">
              <div className="shimmer-bg h-11 w-11 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="shimmer-bg h-3 w-2/3 rounded" />
                <div className="shimmer-bg h-2.5 w-1/2 rounded" />
              </div>
              <div className="shimmer-bg h-10 w-10 rounded-full" />
            </div>
            <div className="mt-3 flex gap-1.5">
              <div className="shimmer-bg h-4 w-12 rounded" />
              <div className="shimmer-bg h-4 w-14 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center',
        className,
      )}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,240,255,0.08)] neon-border-cyan animate-neon-pulse"
      >
        <Inbox className="h-8 w-8 text-[#00F0FF]" />
      </motion.div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        No candidates yet
      </h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Upload a resume and a target job description to begin AI-powered screening.
      </p>
    </div>
  )
}

export default CandidateTable
