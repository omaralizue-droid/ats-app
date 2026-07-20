'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, Loader2, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export interface UploadZoneProps {
  onFileUploaded: (data: { fileName: string; file: File }) => void
  disabled?: boolean
  className?: string
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'done'

const ACCEPTED = '.pdf,.doc,.docx,.txt'
const ACCEPTED_LABELS = ['PDF', 'DOC', 'DOCX', 'TXT']

export function UploadZone({ onFileUploaded, disabled = false, className }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)

  const handleFile = useCallback(
    async (file: File) => {
      // Light validation
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext && !['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
        toast({
          title: 'Unsupported file type',
          description: 'Please upload a PDF, DOC, DOCX, or TXT file.',
          variant: 'destructive',
        })
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB.',
          variant: 'destructive',
        })
        return
      }

      setState('uploading')
      setFileName(file.name)
      setProgress(0)

      // Animate the progress bar
      const startedAt = Date.now()
      const duration = 800
      const tick = () => {
        const elapsed = Date.now() - startedAt
        const pct = Math.min(100, Math.round((elapsed / duration) * 100))
        setProgress(pct)
        if (pct < 100) {
          requestAnimationFrame(tick)
        }
      }
      requestAnimationFrame(tick)

      // Ensure the animation has time to play before handing off
      const elapsed = Date.now() - startedAt
      if (elapsed < duration) {
        await new Promise((r) => setTimeout(r, duration - elapsed))
      }
      setProgress(100)

      setState('done')
      // Brief "done" flash before handing off the raw File to the parent
      setTimeout(() => {
        onFileUploaded({ fileName: file.name, file })
        // Reset to idle after a moment so the user can upload another file
        setTimeout(() => {
          setState('idle')
          setFileName(null)
          setProgress(0)
        }, 600)
      }, 350)
    },
    [onFileUploaded],
  )

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    dragDepth.current += 1
    setState('dragging')
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      if (state !== 'uploading' && state !== 'done') setState('idle')
    }
  }
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    dragDepth.current = 0
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset so selecting the same file again still fires onChange
    e.target.value = ''
  }

  const isBusy = state === 'uploading' || state === 'done'

  return (
    <motion.div
      layout
      className={cn('w-full', className)}
    >
      <motion.div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => !isBusy && !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isBusy && !disabled) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 rounded-xl px-6 py-10 text-center transition-all glass cursor-pointer select-none',
          state === 'idle' && 'hover:bg-white/[0.02] hover:border-white/[0.08]',
          state === 'dragging' && 'border-[#00f0ff]/40 bg-[#00f0ff]/5 scale-[1.01]',
          isBusy && 'cursor-default border-emerald-500/10 bg-zinc-950/20',
          disabled && 'pointer-events-none opacity-40',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={onInputChange}
          disabled={disabled || isBusy}
        />

        {/* Icon */}
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex h-11 w-11 items-center justify-center rounded bg-white/[0.02] border border-white/[0.04]"
            >
              <UploadCloud className="h-5 w-5 text-zinc-400" />
            </motion.div>
          )}
          {state === 'dragging' && (
            <motion.div
              key="dragging"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.15, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex h-11 w-11 items-center justify-center rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30 shadow-lg shadow-[#00f0ff]/10"
            >
              <FileText className="h-5 w-5 text-[#00f0ff]" />
            </motion.div>
          )}
          {state === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex h-11 w-11 items-center justify-center rounded bg-white/[0.02] border border-white/[0.04]"
            >
              <Loader2 className="h-5 w-5 animate-spin text-[#00f0ff]" />
            </motion.div>
          )}
          {state === 'done' && (
            <motion.div
              key="done"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="flex h-11 w-11 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/30"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text content */}
        <div className="flex flex-col items-center gap-1 font-mono">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="idle-text"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex flex-col items-center gap-1"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-white">
                  Stage a Resume
                </p>
                <p className="text-[10px] text-zinc-500">
                  Drag &amp; drop or click to browse · {ACCEPTED_LABELS.join(' · ')}
                </p>
              </motion.div>
            )}
            {state === 'dragging' && (
              <motion.div
                key="drag-text"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex flex-col items-center gap-1"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#00f0ff]">Release to ingest</p>
                <p className="text-[10px] text-[#00f0ff]/60">Analysis will run automatically</p>
              </motion.div>
            )}
            {(state === 'uploading' || state === 'done') && (
              <motion.div
                key="busy-text"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex flex-col items-center gap-1"
              >
                <p className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <FileText className="h-3.5 w-3.5 text-[#00f0ff]" />
                  <span className="max-w-[200px] truncate">{fileName}</span>
                </p>
                <p className="text-[10px] text-zinc-500">
                  {state === 'uploading' ? 'Parsing bytes…' : 'Screening requirements…'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <AnimatePresence>
          {(state === 'uploading' || state === 'done') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-[200px] font-mono"
            >
              <div className="relative h-1 w-full overflow-hidden rounded bg-zinc-950 border border-white/[0.02]">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[#00f0ff]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                  style={{ boxShadow: '0 0 8px #00f0ff' }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[9px] text-zinc-650">
                <span>{progress}%</span>
                <span>~0.8s</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Browse button (only when idle) */}
        {state === 'idle' && (
          <div className="mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/[0.04] bg-white/[0.02] text-zinc-350 hover:bg-white/[0.04] hover:text-white text-[10px] uppercase font-mono tracking-wider"
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
              disabled={disabled}
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Browse files
            </Button>
          </div>
        )}

        {/* Cancel button while uploading */}
        {state === 'uploading' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0 text-zinc-500 hover:text-zinc-200"
            onClick={(e) => {
              e.stopPropagation()
              setState('idle')
              setFileName(null)
              setProgress(0)
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* File type hint */}
        {state === 'idle' && (
          <div className="absolute bottom-2.5 left-0 right-0 flex flex-wrap items-center justify-center gap-1 px-4 font-mono">
            {ACCEPTED_LABELS.map((label) => (
              <span
                key={label}
                className="rounded border border-white/[0.03] bg-white/[0.01] px-1 py-0.5 text-[8px] font-bold text-zinc-500"
              >
                {label}
              </span>
            ))}
            <span className="text-[8px] text-zinc-650">· Max 10MB</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default UploadZone
