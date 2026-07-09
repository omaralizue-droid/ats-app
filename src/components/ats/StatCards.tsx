'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Gauge, ThumbsUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Candidate } from '@/lib/types'

export interface StatCardsProps {
  candidates: Candidate[]
  className?: string
}

interface StatDef {
  key: string
  label: string
  value: number
  suffix?: string
  color: string
  icon: typeof Users
  showProgress?: boolean
}

function useCountUp(target: number, durationMs = 900): number {
  const [val, setVal] = useState(0)
  // Track the latest animated value in a ref so we can start the next
  // animation from where we left off without re-running the effect.
  const currentRef = useRef(0)

  useEffect(() => {
    let raf = 0
    const startVal = currentRef.current
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(1, elapsed / durationMs)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      const next = Math.round(startVal + (target - startVal) * eased)
      setVal(next)
      currentRef.current = next
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return val
}

export function StatCards({ candidates, className }: StatCardsProps) {
  const total = candidates.length
  const avgScore =
    total === 0
      ? 0
      : Math.round(candidates.reduce((s, c) => s + (c.matchScore || 0), 0) / total)
  const shortlisted = candidates.filter((c) => c.status === 'SHORTLIST').length
  const needsReview = candidates.filter((c) => c.status === 'REVIEW').length

  const stats: StatDef[] = [
    {
      key: 'total',
      label: 'Total Candidates',
      value: total,
      color: '#00F0FF',
      icon: Users,
    },
    {
      key: 'avg',
      label: 'Avg Match Score',
      value: avgScore,
      suffix: '%',
      color: '#00FF66',
      icon: Gauge,
      showProgress: true,
    },
    {
      key: 'shortlisted',
      label: 'Shortlisted',
      value: shortlisted,
      color: '#00FF66',
      icon: ThumbsUp,
    },
    {
      key: 'review',
      label: 'Needs Review',
      value: needsReview,
      color: '#FFB340',
      icon: Clock,
    },
  ]

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4',
        className,
      )}
    >
      {stats.map((s, idx) => (
        <StatCard key={s.key} stat={s} index={idx} max={Math.max(total, 100)} />
      ))}
    </div>
  )
}

function StatCard({ stat, index, max }: { stat: StatDef; index: number; max: number }) {
  const Icon = stat.icon
  const animated = useCountUp(stat.value)
  const progressPct = stat.showProgress ? Math.min(100, (animated / 100) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.4), ease: 'easeOut' }}
      className={cn(
        'glass group relative overflow-hidden rounded-2xl p-4 sm:p-5',
        'hover:bg-white/[0.07] transition-colors',
      )}
    >
      {/* Soft glow accent in corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50"
        style={{ background: stat.color }}
      />

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[11px]">
            {stat.label}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className="text-2xl font-bold leading-none tracking-tight sm:text-3xl"
              style={{ color: stat.color, textShadow: `0 0 14px ${stat.color}55` }}
            >
              {animated}
            </span>
            {stat.suffix && (
              <span
                className="text-sm font-semibold"
                style={{ color: stat.color }}
              >
                {stat.suffix}
              </span>
            )}
          </div>
        </div>

        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `${stat.color}1A`,
            border: `1px solid ${stat.color}55`,
            boxShadow: `0 0 14px ${stat.color}25 inset`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color: stat.color }} />
        </div>
      </div>

      {/* Progress bar for the avg score card */}
      {stat.showProgress && (
        <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${stat.color}, ${stat.color}AA)`,
              boxShadow: `0 0 10px ${stat.color}80`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      )}
    </motion.div>
  )
}

export default StatCards
