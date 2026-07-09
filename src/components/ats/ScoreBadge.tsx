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
  green: '#00FF66',
  amber: '#FFB340',
  red: '#FF2D55',
}

const TONE_TEXT: Record<Tone, string> = {
  green: 'text-[#00FF66]',
  amber: 'text-[#FFB340]',
  red: 'text-[#FF2D55]',
}

const SIZE_CLASSES: Record<NonNullable<ScoreBadgeProps['size']>, {
  container: string
  number: string
  ring: number
  stroke: number
}> = {
  sm: {
    container: 'h-10 w-10 min-w-10',
    number: 'text-sm font-bold',
    ring: 36,
    stroke: 3,
  },
  md: {
    container: 'h-16 w-16 min-w-16',
    number: 'text-xl font-bold',
    ring: 56,
    stroke: 4,
  },
  lg: {
    container: 'h-28 w-28 min-w-28',
    number: 'text-4xl font-bold',
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

  // Count-up animation: only run when animateCount is true. We never call
  // setState synchronously in the effect body — the update happens inside
  // framer-motion's animation callback (an external system).
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

  // What we render: animated value when counting up, else the raw score.
  const displayScore = animateCount ? animatedScore : score

  // Circular progress offset
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
          'relative flex items-center justify-center rounded-full',
          sizes.container,
        )}
        style={{
          boxShadow: `0 0 18px ${hex}33, inset 0 0 10px ${hex}22`,
        }}
      >
        {/* Pulsing glow halo */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-neon-pulse pointer-events-none"
          style={{ boxShadow: `0 0 22px ${hex}40` }}
        />
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
            stroke="rgba(255,255,255,0.07)"
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
            style={{ filter: `drop-shadow(0 0 4px ${hex})` }}
          />
        </svg>
        <div className="relative flex flex-col items-center justify-center">
          <span className={cn(sizes.number, TONE_TEXT[tone])} style={{ textShadow: `0 0 12px ${hex}88` }}>
            {displayScore}
          </span>
          {size === 'lg' && (
            <span className="text-[10px] font-medium text-muted-foreground tracking-widest mt-0.5">
              / 100
            </span>
          )}
        </div>
      </motion.div>
      {size === 'lg' && (
        <div className="mt-2 flex flex-col items-center">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: hex, textShadow: `0 0 10px ${hex}66` }}
          >
            {tone === 'green' ? 'Strong Match' : tone === 'amber' ? 'Partial Match' : 'Low Match'}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">Match Score</span>
        </div>
      )}
    </div>
  )
}

export default ScoreBadge
