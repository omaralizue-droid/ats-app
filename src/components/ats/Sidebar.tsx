'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  BarChart3,
  Radar,
  Menu,
  X,
  Gauge,
  ThumbsUp,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SidebarStats {
  total: number
  shortlisted: number
  review: number
  rejected: number
  avgScore: number
}

export interface SidebarProps {
  activeView: string
  onNavigate: (view: string) => void
  stats: SidebarStats
  className?: string
}

const NAV_ITEMS = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'candidates', label: 'Candidates', icon: Users },
  { value: 'upload', label: 'Upload', icon: UploadCloud },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
] as const

export function Sidebar({ activeView, onNavigate, stats, className }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'glass sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-white/[0.03] bg-zinc-950/20 md:flex',
          className,
        )}
      >
        <SidebarContent
          activeView={activeView}
          onNavigate={onNavigate}
          stats={stats}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="bg-zinc-950/50 backdrop-blur-xl border-b border-white/[0.03] sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:hidden">
        <Logo />
        <MobileNav
          activeView={activeView}
          onNavigate={onNavigate}
          stats={stats}
        />
      </div>
    </>
  )
}

function SidebarContent({
  activeView,
  onNavigate,
  stats,
}: {
  activeView: string
  onNavigate: (view: string) => void
  stats: SidebarStats
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/[0.03] px-5 bg-white/[0.01]">
        <Logo />
      </div>

      {/* Nav */}
      <nav className="custom-scroll flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">
          Workspace
        </p>
        <ul className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.value
            return (
              <li key={item.value}>
                <button
                  onClick={() => onNavigate(item.value)}
                  className={cn(
                    'group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'bg-white/[0.04] text-white border border-white/[0.05] shadow-lg shadow-black/20'
                      : 'text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200 border border-transparent',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-[#CC0000]' : 'text-zinc-500 group-hover:text-zinc-400',
                    )}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#CC0000]" style={{ boxShadow: '0 0 8px #CC0000' }} />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-white/[0.03] p-4 bg-white/[0.01]">
        <p className="mb-3 px-1 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">
          Pipeline
        </p>
        <div className="grid grid-cols-2 gap-2 font-mono">
          <MiniStatCard label="Total"       value={stats.total}       color="#CC0000" icon={<Users    className="h-3.5 w-3.5" />} />
          <MiniStatCard label="Shortlist"   value={stats.shortlisted} color="#10b981" icon={<ThumbsUp className="h-3.5 w-3.5" />} />
          <MiniStatCard label="Avg Fit"     value={stats.avgScore}    color="#8b5cf6" icon={<Gauge    className="h-3.5 w-3.5" />} suffix="%" />
          <MiniStatCard label="Rejected"    value={stats.rejected}    color="#ef4444" icon={<X        className="h-3.5 w-3.5" />} />
        </div>
      </div>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/zue-logo.png"
        alt="Zue Group of Companies"
        className="h-8 w-auto object-contain"
        style={{ filter: 'brightness(1.05)' }}
      />
    </div>
  )
}

function MiniStatCard({
  label, value, color, icon, suffix = '',
}: {
  label: string
  value: number
  color: string
  icon: React.ReactNode
  suffix?: string
}) {
  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg bg-zinc-950/60 border border-white/[0.03] px-2.5 py-2"
    >
      <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-zinc-550">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <span className="text-sm font-extrabold leading-none text-white tracking-tight">
        {value}{suffix}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mobile nav (Sheet)
// ---------------------------------------------------------------------------

function MobileNav({
  activeView,
  onNavigate,
  stats,
}: {
  activeView: string
  onNavigate: (view: string) => void
  stats: SidebarStats
}) {
  const [open, setOpen] = useState(false)

  const handleNavigate = (v: string) => {
    onNavigate(v)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="border border-white/10 bg-white/[0.03] text-foreground hover:bg-white/[0.06]"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="glass-strong w-[260px] border-r border-white/10 p-0"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate between dashboard views
        </SheetDescription>
        <SheetClose className="sr-only">Close</SheetClose>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-white/5 px-5">
            <Logo />
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <SidebarContent
            activeView={activeView}
            onNavigate={handleNavigate}
            stats={stats}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default Sidebar
