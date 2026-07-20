'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FileText, X, CheckCircle2, Target } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface JobDescriptionInputProps {
  value: string
  onChange: (v: string) => void
  onClear?: () => void
  className?: string
  /** Minimum recommended length before we show the "ready" indicator. */
  minLength?: number
}

const READY_THRESHOLD = 60

export function JobDescriptionInput({
  value,
  onChange,
  onClear,
  className,
  minLength = READY_THRESHOLD,
}: JobDescriptionInputProps) {
  const isReady = value.trim().length >= minLength
  const charCount = value.length

  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('bg-zinc-950 border border-zinc-900 rounded-xl p-5', className)}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Target className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="jd-input"
              className="text-sm font-semibold tracking-tight text-zinc-200"
            >
              Target Job Description
            </label>
            <span className="text-[11px] text-zinc-500">
              Paste the role spec to enable AI matching
            </span>
          </div>
        </div>

        {/* Ready indicator */}
        <AnimatePresence mode="wait">
          {isReady ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">JD ready</span>
            </motion.div>
          ) : (
            <motion.div
              key="not-ready"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5"
            >
              <FileText className="h-3 w-3 text-zinc-550" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">No JD yet</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Textarea wrapper */}
      <div className="relative">
        <Textarea
          id="jd-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the job description here (minimum 60 characters)..."
          className={cn(
            'custom-scroll min-h-[200px] resize-y rounded-lg border border-zinc-850 bg-zinc-900/10 px-4 py-3 text-sm leading-relaxed text-zinc-200',
            'placeholder:text-zinc-500/70',
            'focus-visible:border-blue-500 focus-visible:ring-blue-500/25',
            isReady && 'border-emerald-500/20 bg-zinc-900/5',
          )}
        />
        {/* Clear button */}
        <AnimatePresence>
          {charCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="absolute right-2 top-2"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 gap-1 px-2 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-150 font-semibold"
                aria-label="Clear job description"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer: char count + hint */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-550">
        <span>
          {charCount === 0
            ? 'Tip: include required skills and seniority for better precision.'
            : `${charCount.toLocaleString()} characters`}
        </span>
        {charCount > 0 && charCount < minLength && (
          <span className="text-amber-500/90 font-medium">
            {minLength - charCount} more characters to unlock matching
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default JobDescriptionInput
