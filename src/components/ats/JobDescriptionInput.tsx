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
      className={cn('glass rounded-2xl p-5', className)}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(0,240,255,0.1)] neon-border-cyan">
            <Target className="h-4 w-4 text-[#00F0FF]" />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="jd-input"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              Target Job Description
            </label>
            <span className="text-[11px] text-muted-foreground">
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
              className="flex items-center gap-1.5 rounded-full border border-[rgba(0,255,102,0.4)] bg-[rgba(0,255,102,0.08)] px-2.5 py-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF66]" />
              <span className="text-[11px] font-medium text-[#00FF66]">JD ready</span>
            </motion.div>
          ) : (
            <motion.div
              key="not-ready"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground">No JD yet</span>
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
          placeholder="Paste the job description here to enable AI matching..."
          className={cn(
            'custom-scroll min-h-[200px] resize-y rounded-xl border bg-black/30 px-4 py-3 text-sm leading-relaxed',
            'placeholder:text-muted-foreground/70',
            'focus-visible:border-[#00F0FF] focus-visible:ring-[#00F0FF]/30',
            isReady && 'border-[rgba(0,255,102,0.3)]',
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
                className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:bg-white/5 hover:text-foreground"
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
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {charCount === 0
            ? 'Tip: include required skills, experience level, and responsibilities for best results.'
            : `${charCount.toLocaleString()} characters`}
        </span>
        {charCount > 0 && charCount < minLength && (
          <span className="text-[#FFB340]">
            {minLength - charCount} more chars to unlock matching
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default JobDescriptionInput
