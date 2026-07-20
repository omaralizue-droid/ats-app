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
          'relative flex flex-col items-center justify-center gap-4 rounded-xl px-6 py-10 text-center transition-all bg-zinc-900/25 border border-zinc-850',
          'cursor-pointer select-none',
          state === 'idle' && 'border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40',
          state === 'dragging' && 'border-blue-500 bg-blue-500/[0.03] scale-[1.01]',
          isBusy && 'cursor-default border-emerald-500/20 bg-zinc-900/40',
          disabled && 'pointer-events-none opacity-50',
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
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800"
            >
              <UploadCloud className="h-5 w-5 text-zinc-400" />
            </motion.div>
          )}
          {state === 'dragging' && (
            <motion.div
              key="dragging"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30"
            >
              <FileText className="h-5 w-5 text-blue-500" />
            </motion.div>
          )}
          {state === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800"
            >
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </motion.div>
          )}
          {state === 'done' && (
            <motion.div
              key="done"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text content */}
        <div className="flex flex-col items-center gap-1">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="idle-text"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex flex-col items-center gap-1"
              >
                <p className="text-sm font-semibold tracking-tight text-zinc-200">
                  Upload a resume
                </p>
                <p className="text-xs text-zinc-500">
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
                <p className="text-sm font-semibold text-blue-500">Release to upload</p>
                <p className="text-xs text-zinc-400">Parsing will begin instantly</p>
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
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  <span className="max-w-[200px] truncate">{fileName}</span>
                </p>
                <p className="text-[11px] text-zinc-500">
                  {state === 'uploading' ? 'Reading resume…' : 'Sending to AI engine…'}
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
              className="w-full max-w-[240px]"
            >
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                <span>{progress}%</span>
                <span>~ 1s</span>
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
              className="border-zinc-800 bg-zinc-900/50 text-zinc-350 hover:bg-zinc-900 hover:text-zinc-100"
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
          <div className="absolute bottom-2.5 left-0 right-0 flex flex-wrap items-center justify-center gap-1 px-4">
            {ACCEPTED_LABELS.map((label) => (
              <span
                key={label}
                className="rounded border border-zinc-800/40 bg-zinc-900/20 px-1 py-0.5 text-[9px] font-semibold text-zinc-500"
              >
                {label}
              </span>
            ))}
            <span className="text-[9px] text-zinc-650">· Max 10MB</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default UploadZone
