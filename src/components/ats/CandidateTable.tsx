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
  Trash2,
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
  onDeleteCandidate?: (id: string, name: string) => void
  className?: string
}

const STATUS_META: Record<
  CandidateStatus,
  { label: string; color: string; bg: string; border: string; icon: typeof Clock }
> = {
  REVIEW: {
    label: 'Review',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.18)',
    icon: Clock,
  },
  SHORTLIST: {
    label: 'Shortlist',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.06)',
    border: 'rgba(16,185,129,0.18)',
    icon: ThumbsUp,
  },
  REJECT: {
    label: 'Reject',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.18)',
    icon: XCircle,
  },
}

function safeArray(val: unknown): string[] {
  if (Array.isArray(val)) return val
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed
      return [val]
    } catch {
      return [val]
    }
  }
  return []
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
  onDeleteCandidate,
  className,
}: CandidateTableProps) {
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
    <div className={cn('glass w-full overflow-hidden rounded-xl', className)}>
      {/* Desktop / tablet: full table */}
      <div className="hidden md:block">
        <div className="custom-scroll overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent bg-white/5">
                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Candidate
                </TableHead>
                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Match
                </TableHead>
                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Skills
                </TableHead>
                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-200 font-mono">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-200 font-mono">
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
                    onDeleteCandidate={onDeleteCandidate}
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
              onDeleteCandidate={onDeleteCandidate}
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
  onDeleteCandidate,
}: {
  candidate: Candidate
  index: number
  onSelectCandidate: (c: Candidate) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
  onDeleteCandidate?: (id: string, name: string) => void
}) {
  const allSkills = safeArray(candidate?.topSkills)
  const visibleSkills = allSkills.slice(0, 4)
  const extraCount = allSkills.length - visibleSkills.length

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className={cn(
        'group relative border-b border-white/[0.03] transition-colors',
        'hover:bg-white/[0.01]',
      )}
    >
      <TableCell className="relative px-4 py-3">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-[#00f0ff] transition-transform duration-200 group-hover:scale-y-100"
          style={{ boxShadow: '0 0 8px #00f0ff' }}
        />
        <button
          onClick={() => onSelectCandidate(candidate)}
          className="flex items-center gap-3 text-left cursor-pointer"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20"
          >
            {getInitials(candidate.name)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-200 group-hover:text-blue-400 transition-colors uppercase tracking-wider font-mono">
              {candidate.name}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-300 font-medium">
              <Mail className="h-3.5 w-3.5 text-zinc-400 opacity-80" />
              <span className="max-w-[200px] truncate font-mono">{candidate.email}</span>
            </span>
            {candidate.latestRole && (
              <span className="flex items-center gap-1.5 text-[10px] text-zinc-300 font-medium mt-0.5">
                <Briefcase className="h-3.5 w-3.5 text-zinc-400 opacity-80" />
                <span className="max-w-[200px] truncate font-mono">
                  {candidate.latestRole}
                  {candidate.latestCompany ? ` · ${candidate.latestCompany}` : ''}
                </span>
              </span>
            )}
          </div>
        </button>
      </TableCell>

      <TableCell className="px-4 py-3">
        <ScoreBadge score={candidate.matchScore} size="sm" animateCount={false} />
      </TableCell>

      <TableCell className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1 max-w-[280px] font-mono">
          {visibleSkills.map((s) => (
            <span
              key={s}
              className="rounded bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.5 text-[9px] font-bold text-blue-300 uppercase"
            >
              {s}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="rounded bg-white/10 border border-white/15 px-1 py-0.5 text-[8px] font-bold text-zinc-300">
              +{extraCount}
            </span>
          )}
          {candidate.topSkills.length === 0 && (
            <span className="text-[10px] text-zinc-650 font-mono">—</span>
          )}
        </div>
      </TableCell>

      <TableCell className="px-4 py-3">
        <StatusDropdown
          status={candidate.status}
          onChange={(s) => onStatusChange(candidate.id, s)}
        />
      </TableCell>

      <TableCell className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectCandidate(candidate)}
            className="h-8 gap-1.5 border border-white/[0.04] bg-white/[0.02] text-zinc-300 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white text-[10px] font-mono uppercase tracking-wider cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-[#CC0000]" />
            View
          </Button>
          {onDeleteCandidate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteCandidate?.(candidate.id, candidate.name)}
              className="h-8 w-8 p-0 border border-white/[0.04] bg-white/[0.02] text-zinc-500 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
              title="Delete Candidate Profile"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
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
  onDeleteCandidate,
}: {
  candidate: Candidate
  index: number
  onSelectCandidate: (c: Candidate) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
  onDeleteCandidate?: (id: string, name: string) => void
}) {
  const allSkills = safeArray(candidate?.topSkills)
  const visibleSkills = allSkills.slice(0, 4)
  const extraCount = allSkills.length - visibleSkills.length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      className="relative overflow-hidden rounded-xl border border-white/[0.03] bg-zinc-950/40 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onSelectCandidate(candidate)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20"
          >
            {getInitials(candidate.name)}
          </div>
          <div className="flex min-w-0 flex-col font-mono">
            <span className="truncate text-xs font-bold text-zinc-200 uppercase tracking-wider">
              {candidate.name}
            </span>
            <span className="truncate text-[10px] text-zinc-500 mt-0.5">{candidate.email}</span>
            {candidate.latestRole && (
              <span className="truncate text-[10px] text-zinc-600 mt-0.5">
                {candidate.latestRole}
                {candidate.latestCompany ? ` · ${candidate.latestCompany}` : ''}
              </span>
            )}
          </div>
        </button>
        <ScoreBadge score={candidate.matchScore} size="sm" animateCount={false} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1 font-mono">
        {visibleSkills.map((s) => (
          <span
            key={s}
            className="rounded bg-white/[0.01] border border-white/[0.03] px-1.5 py-0.5 text-[9px] font-bold text-zinc-400 uppercase"
          >
            {s}
          </span>
        ))}
        {extraCount > 0 && (
          <span className="rounded bg-white/[0.02] border border-white/[0.04] px-1 py-0.5 text-[8px] font-bold text-zinc-650">
            +{extraCount}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <StatusDropdown
          status={candidate.status}
          onChange={(s) => onStatusChange(candidate.id, s)}
        />
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectCandidate(candidate)}
            className="h-8 gap-1.5 border border-white/[0.04] bg-white/[0.02] text-zinc-300 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white text-[10px] font-mono uppercase tracking-wider"
          >
            <Eye className="h-3.5 w-3.5 text-[#CC0000]" />
            View
          </Button>
          {onDeleteCandidate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteCandidate?.(candidate.id, candidate.name)}
              className="h-8 w-8 p-0 border border-white/[0.04] bg-white/[0.02] text-zinc-500 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              title="Delete Candidate Profile"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
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
          className="group flex items-center gap-1.5 rounded border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all hover:brightness-110 cursor-pointer font-mono"
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
        className="min-w-[150px] border-white/[0.05] bg-zinc-950/95 backdrop-blur-xl font-mono"
      >
        <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-wider text-zinc-550">
          Change status
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/[0.03]" />
        {STATUS_OPTIONS.map((opt) => {
          const m = STATUS_META[opt]
          const Icon = m.icon
          const isActive = opt === status
          return (
            <DropdownMenuItem
              key={opt}
              onClick={() => onChange(opt)}
              className={cn(
                'flex items-center gap-2 rounded px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors',
                isActive ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]',
              )}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
              <span style={{ color: isActive ? m.color : undefined }} className="text-zinc-350">
                {m.label}
              </span>
              {isActive && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00f0ff]"
                  style={{ boxShadow: '0 0 8px #00f0ff' }}
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
    <div className={cn('bg-zinc-950 border border-zinc-900 w-full overflow-hidden rounded-xl', className)}>
      <div className="hidden md:block">
        <div className="border-b border-zinc-900 px-4 py-3 bg-zinc-900/10">
          <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr] gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer-bg h-3 w-3/4 rounded" />
            ))}
          </div>
        </div>
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="border-b border-zinc-900 px-4 py-3 bg-zinc-950">
            <div className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr] items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="shimmer-bg h-9 w-9 rounded-lg" />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="shimmer-bg h-3 w-2/3 rounded" />
                  <div className="shimmer-bg h-2.5 w-1/2 rounded" />
                </div>
              </div>
              <div className="shimmer-bg h-8 w-8 rounded-full" />
              <div className="flex gap-1">
                <div className="shimmer-bg h-4 w-12 rounded" />
                <div className="shimmer-bg h-4 w-14 rounded" />
              </div>
              <div className="shimmer-bg h-4 w-16 rounded-full" />
              <div className="shimmer-bg ml-auto h-7 w-14 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 p-3 md:hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-900 bg-zinc-950 p-3.5">
            <div className="flex items-center gap-3">
              <div className="shimmer-bg h-10 w-10 rounded-lg" />
              <div className="flex flex-1 flex-col gap-1">
                <div className="shimmer-bg h-3 w-2/3 rounded" />
                <div className="shimmer-bg h-2.5 w-1/2 rounded" />
              </div>
              <div className="shimmer-bg h-8 w-8 rounded-full" />
            </div>
            <div className="mt-3 flex gap-1">
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
        'bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center',
        className,
      )}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500"
      >
        <Inbox className="h-5 w-5" />
      </motion.div>
      <h3 className="text-sm font-bold tracking-tight text-zinc-200">
        No candidates yet
      </h3>
      <p className="mt-1.5 max-w-xs text-xs text-zinc-500 leading-relaxed">
        Upload a resume and a target job description to begin AI-powered screening.
      </p>
    </div>
  )
}

export default CandidateTable
