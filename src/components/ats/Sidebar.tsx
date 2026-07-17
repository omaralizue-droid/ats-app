'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
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

const ThreeCanvas = dynamic(() => import('@/components/three/ThreeCanvas'), {
  ssr: false,
})

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
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* Three.js subtle particle field inside sidebar */}
        <ThreeCanvas particleCount={35} variant="sparse" className="opacity-30" />
        <div className="relative z-10 flex h-full flex-col">
          <SidebarContent
            activeView={activeView}
            onNavigate={onNavigate}
            stats={stats}
          />
        </div>
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
                    'group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white/[0.05] text-[#00F0FF]'
                      : 'text-muted-foreground hover:bg-white/[0.03] hover:text-foreground',
                  )}
                >
                  {/* Active left border accent */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-[#00F0FF]"
                      style={{ boxShadow: '0 0 12px rgba(0,240,255,0.8)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-[#00F0FF]' : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Stats mini cards */}
      <div className="border-t border-white/5 p-3">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Pipeline
        </p>
        <div className="grid grid-cols-2 gap-2">
          <MiniStatCard
            label="Total"
            value={stats.total}
            color="#00F0FF"
            icon={<Users className="h-3 w-3" />}
          />
          <MiniStatCard
            label="Shortlisted"
            value={stats.shortlisted}
            color="#00FF66"
            icon={<ThumbsUp className="h-3 w-3" />}
          />
          <MiniStatCard
            label="Avg score"
            value={stats.avgScore}
            suffix=""
            color="#FFB340"
            icon={<Gauge className="h-3 w-3" />}
          />
          <MiniStatCard
            label="Rejected"
            value={stats.rejected}
            color="#FF2D55"
            icon={<X className="h-3 w-3" />}
          />
        </div>
      </div>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(0,240,255,0.1)] neon-border-cyan"
      >
        <Radar className="h-4 w-4 text-[#00F0FF]" />
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-lg"
          animate={{ boxShadow: ['0 0 0px rgba(0,240,255,0)', '0 0 12px rgba(0,240,255,0.5)', '0 0 0px rgba(0,240,255,0)'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className="gradient-text-cyan text-base font-bold tracking-tight">
          NeonATS
        </span>
        <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          AI Resume ATS
        </span>
      </div>
    </div>
  )
}

function MiniStatCard({
  label,
  value,
  color,
  icon,
  suffix,
}: {
  label: string
  value: number
  color: string
  icon: React.ReactNode
  suffix?: string
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-lg border bg-white/[0.02] px-2.5 py-2"
      style={{ borderColor: `${color}30` }}
    >
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <span
        className="text-lg font-bold leading-none"
        style={{ color, textShadow: `0 0 10px ${color}55` }}
      >
        {value}
        {suffix}
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
