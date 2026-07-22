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
      className={cn('glass rounded-xl p-5', className)}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-500/10 border border-blue-500/20 shadow-inner">
            <Target className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="jd-input"
              className="text-xs font-bold uppercase tracking-wider text-white"
            >
              Job Spec
            </label>
            <span className="text-[10px] text-zinc-300 font-medium">
              Paste role details for model match
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
              className="flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1"
              style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)' }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">Ingest Ready</span>
            </motion.div>
          ) : (
            <motion.div
              key="not-ready"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2.5 py-1"
            >
              <FileText className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-wider">Empty Spec</span>
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
          placeholder="Paste requirements spec..."
          className={cn(
            'custom-scroll min-h-[200px] resize-y rounded border border-white/15 bg-[#0f1222]/90 px-4 py-3 text-xs leading-relaxed text-zinc-100 font-mono transition-colors shadow-inner',
            'placeholder:text-zinc-400',
            'focus-visible:border-blue-400 focus-visible:ring-blue-400/20',
            isReady && 'border-emerald-500/30 bg-[#0f1526]/95',
          )}
        />
        {/* Clear button */}
        <AnimatePresence>
          {charCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="absolute right-2 top-2 font-mono"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 gap-1 px-2 text-[9px] text-zinc-300 hover:text-white border border-white/10 bg-zinc-900/80 uppercase tracking-wider"
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
      <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-300 font-mono font-medium">
        <span>
          {charCount === 0
            ? 'Tip: Paste full requirements.'
            : `${charCount.toLocaleString()} chars`}
        </span>
        {charCount > 0 && charCount < minLength && (
          <span className="text-amber-400 font-bold">
            {minLength - charCount} more characters to unlock
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default JobDescriptionInput
