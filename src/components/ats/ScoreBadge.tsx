'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  /** Disable the count-up animation (e.g. for inline table rows). */
  animateCount?: boolean
  className?: string
}

type Tone = 'green' | 'amber' | 'red'

function getTone(score: number): Tone {
  if (score >= 75) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}

const TONE_HEX: Record<Tone, string> = {
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
}

const TONE_TEXT: Record<Tone, string> = {
  green: 'text-emerald-500',
  amber: 'text-amber-500',
  red: 'text-red-500',
}

const SIZE_CLASSES: Record<NonNullable<ScoreBadgeProps['size']>, {
  container: string
  number: string
  ring: number
  stroke: number
}> = {
  sm: {
    container: 'h-10 w-10 min-w-10',
    number: 'text-sm font-bold font-mono',
    ring: 36,
    stroke: 3,
  },
  md: {
    container: 'h-16 w-16 min-w-16',
    number: 'text-xl font-bold font-mono',
    ring: 56,
    stroke: 4,
  },
  lg: {
    container: 'h-28 w-28 min-w-28',
    number: 'text-4xl font-extrabold font-mono tracking-tight',
    ring: 104,
    stroke: 6,
  },
}

export function ScoreBadge({
  score,
  size = 'md',
  animateCount = true,
  className,
}: ScoreBadgeProps) {
  const tone = getTone(score)
  const hex = TONE_HEX[tone]
  const sizes = SIZE_CLASSES[size]

  const radius = (sizes.ring - sizes.stroke) / 2
  const circumference = 2 * Math.PI * radius

  const count = useMotionValue(0)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    if (!animateCount) return
    const controls = animate(count, score, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => setAnimatedScore(Math.round(v)),
    })
    return () => controls.stop()
  }, [score, animateCount, count])

  const displayScore = animateCount ? animatedScore : score
  const offset = circumference - (displayScore / 100) * circumference

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-1', className)}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className={cn(
          'relative flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 shadow-sm',
          sizes.container,
        )}
      >
        {/* Background ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={sizes.ring}
          height={sizes.ring}
          viewBox={`0 0 ${sizes.ring} ${sizes.ring}`}
        >
          <circle
            cx={sizes.ring / 2}
            cy={sizes.ring / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={sizes.stroke}
          />
          <motion.circle
            cx={sizes.ring / 2}
            cy={sizes.ring / 2}
            r={radius}
            fill="none"
            stroke={hex}
            strokeWidth={sizes.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </svg>
        <div className="relative flex flex-col items-center justify-center">
          <span className={cn(sizes.number, TONE_TEXT[tone])}>
            {displayScore}
          </span>
          {size === 'lg' && (
            <span className="text-[9px] font-bold text-zinc-500 tracking-wider mt-0.5 uppercase font-mono">
              / 100
            </span>
          )}
        </div>
      </motion.div>
      {size === 'lg' && (
        <div className="mt-2 flex flex-col items-center">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: hex }}
          >
            {tone === 'green' ? 'Strong Match' : tone === 'amber' ? 'Partial Match' : 'Low Match'}
          </span>
          <span className="mt-1 text-[11px] text-zinc-500 font-medium">Match Score</span>
        </div>
      )}
    </div>
  )
}

export default ScoreBadge
