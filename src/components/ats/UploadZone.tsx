'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, Loader2, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export interface UploadZoneProps {
  onFileUploaded: (data: { fileName: string; resumeText: string }) => void
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

      // Read text in parallel
      let resumeText = ''
      try {
        resumeText = await file.text()
      } catch {
        resumeText = ''
      }

      // Ensure the animation has time to play
      const elapsed = Date.now() - startedAt
      if (elapsed < duration) {
        await new Promise((r) => setTimeout(r, duration - elapsed))
      }
      setProgress(100)

      setState('done')
      // Brief "done" flash before handing off
      setTimeout(() => {
        onFileUploaded({ fileName: file.name, resumeText })
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
          'glass relative flex flex-col items-center justify-center gap-4 rounded-2xl px-6 py-10 text-center transition-all',
          'cursor-pointer select-none',
          state === 'idle' && 'border-dashed border-2 border-[rgba(0,240,255,0.35)] hover:border-[rgba(0,240,255,0.7)] hover:bg-white/[0.07]',
          state === 'dragging' && 'border-2 border-[#00F0FF] bg-[rgba(0,240,255,0.06)] neon-glow-cyan scale-[1.01]',
          isBusy && 'cursor-default border-[rgba(0,255,102,0.4)]',
          disabled && 'pointer-events-none opacity-60',
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
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,240,255,0.1)] neon-border-cyan animate-neon-pulse"
            >
              <UploadCloud className="h-8 w-8 text-[#00F0FF]" />
            </motion.div>
          )}
          {state === 'dragging' && (
            <motion.div
              key="dragging"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.15, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,240,255,0.2)] neon-glow-cyan"
            >
              <FileText className="h-8 w-8 text-[#00F0FF]" />
            </motion.div>
          )}
          {state === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,240,255,0.12)]"
            >
              <Loader2 className="h-8 w-8 animate-spin text-[#00F0FF]" />
            </motion.div>
          )}
          {state === 'done' && (
            <motion.div
              key="done"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,255,102,0.15)] neon-border-green"
            >
              <CheckCircle2 className="h-8 w-8 text-[#00FF66]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text content */}
        <div className="flex flex-col items-center gap-1.5">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="idle-text"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex flex-col items-center gap-1.5"
              >
                <p className="text-base font-semibold tracking-tight text-foreground">
                  Drag &amp; drop your resume here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse · {ACCEPTED_LABELS.join(' · ')}
                </p>
              </motion.div>
            )}
            {state === 'dragging' && (
              <motion.div
                key="drag-text"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex flex-col items-center gap-1.5"
              >
                <p className="text-base font-semibold neon-text-cyan">Release to upload</p>
                <p className="text-xs text-muted-foreground">Parsing will begin instantly</p>
              </motion.div>
            )}
            {(state === 'uploading' || state === 'done') && (
              <motion.div
                key="busy-text"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex flex-col items-center gap-1.5"
              >
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="h-4 w-4 text-[#00F0FF]" />
                  <span className="max-w-[260px] truncate">{fileName}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {state === 'uploading' ? 'Reading resume…' : 'Resume ready · sending to AI…'}
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
              className="w-full max-w-sm"
            >
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #00F0FF 0%, #00FF66 100%)',
                    boxShadow: '0 0 12px rgba(0,240,255,0.6)',
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{progress}%</span>
                <span>~ 1 sec</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Browse button + reset (only when idle) */}
        {state === 'idle' && (
          <div className="mt-1 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-[rgba(0,240,255,0.4)] bg-transparent text-[#00F0FF] hover:bg-[rgba(0,240,255,0.1)] hover:text-[#00F0FF]"
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
              disabled={disabled}
            >
              <UploadCloud className="h-4 w-4" />
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
            className="absolute right-3 top-3 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              setState('idle')
              setFileName(null)
              setProgress(0)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* File type hint */}
        {state === 'idle' && (
          <div className="absolute bottom-3 left-0 right-0 flex flex-wrap items-center justify-center gap-1.5 px-4">
            {ACCEPTED_LABELS.map((label) => (
              <span
                key={label}
                className="rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {label}
              </span>
            ))}
            <span className="text-[10px] text-muted-foreground">· Max 10MB</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default UploadZone
