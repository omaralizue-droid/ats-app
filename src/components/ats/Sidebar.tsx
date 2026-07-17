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
      {/* Desktop sidebar (md+) */}
      <aside
        className={cn(
          'glass-strong sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-white/5 md:flex',
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
      <div className="glass-strong sticky top-0 z-30 flex items-center justify-between border-b border-white/5 px-4 py-3 md:hidden">
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
      <div className="flex h-16 items-center border-b border-white/5 px-5">
        <Logo />
      </div>

      {/* Nav */}
      <nav className="custom-scroll flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </p>
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.value
            return (
              <li key={item.value}>
                <button
                  onClick={() => onNavigate(item.value)}
                  className={cn(
                    'group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/[0.04] text-white/80'
                      : 'text-white/30 hover:bg-white/[0.025] hover:text-white/60',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-y-1.5 left-0 w-[2px] rounded-r-full bg-[#4090ff]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-[#4090ff]' : 'text-white/25 group-hover:text-white/50',
                    )}
                  />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-white/[0.05] p-3">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/20">
          Pipeline
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <MiniStatCard label="Total"       value={stats.total}       color="#4090ff" icon={<Users    className="h-3 w-3" />} />
          <MiniStatCard label="Shortlisted" value={stats.shortlisted} color="#40d080" icon={<ThumbsUp className="h-3 w-3" />} />
          <MiniStatCard label="Avg score"   value={stats.avgScore}    color="#ffb340" icon={<Gauge    className="h-3 w-3" />} suffix="" />
          <MiniStatCard label="Rejected"    value={stats.rejected}    color="#ff4060" icon={<X        className="h-3 w-3" />} />
        </div>
      </div>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: 'rgba(64,144,255,0.08)', border: '1px solid rgba(64,144,255,0.2)' }}
      >
        <Radar className="h-4 w-4 text-[#4090ff]" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="gradient-text text-base font-bold tracking-tight">
          NeonATS
        </span>
        <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/20">
          AI Resume ATS
        </span>
      </div>
    </div>
  )
}

function MiniStatCard({
  label, value, color, icon, suffix = '%',
}: {
  label: string
  value: number
  color: string
  icon: React.ReactNode
  suffix?: string
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-lg bg-white/[0.02] px-2.5 py-2"
      style={{ border: `1px solid ${color}20` }}
    >
      <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-white/20">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <span className="text-lg font-black leading-none" style={{ color }}>
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
