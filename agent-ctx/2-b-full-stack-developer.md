# Task 2-b — Frontend ATS Components

**Agent:** full-stack-developer
**Date:** NeonATS sprint
**Scope:** Build presentational frontend components in `src/components/ats/`

## Files Created

| File | Purpose |
|------|---------|
| `src/components/ats/ScoreBadge.tsx` | Circular animated match-score badge with tone-based color/glow |
| `src/components/ats/UploadZone.tsx` | Drag-and-drop resume upload zone with progress animation |
| `src/components/ats/JobDescriptionInput.tsx` | Glassmorphism textarea for the target JD with live char count |
| `src/components/ats/CandidateTable.tsx` | Dashboard table with status dropdown + skeleton loading + responsive mobile cards |
| `src/components/ats/CandidateDetail.tsx` | Slide-in Sheet with full candidate profile (verdict, skills, strengths, etc.) |
| `src/components/ats/Sidebar.tsx` | Vertical sidebar with nav + pipeline mini-stats; collapses to mobile Sheet |
| `src/components/ats/StatCards.tsx` | 4 animated stat cards (total / avg score / shortlisted / needs review) |
| `src/components/ats/index.ts` | Barrel re-exports for all 7 components + their prop types |

## Props Interfaces (exact contract for the orchestrator)

```ts
// ScoreBadge
interface ScoreBadgeProps {
  score: number                       // 0-100
  size?: 'sm' | 'md' | 'lg'           // default 'md'
  animateCount?: boolean              // default true; pass false for table rows
  className?: string
}

// UploadZone
interface UploadZoneProps {
  onFileUploaded: (data: { fileName: string; resumeText: string }) => void
  disabled?: boolean
  className?: string
}

// JobDescriptionInput
interface JobDescriptionInputProps {
  value: string
  onChange: (v: string) => void
  onClear?: () => void
  className?: string
  minLength?: number                  // default 60 — threshold for "JD ready" pill
}

// CandidateTable
interface CandidateTableProps {
  candidates: Candidate[]
  loading?: boolean
  onSelectCandidate: (c: Candidate) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
  className?: string
}

// CandidateDetail
interface CandidateDetailProps {
  candidate: Candidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (id: string, status: CandidateStatus) => void
}

// Sidebar
interface SidebarStats {
  total: number
  shortlisted: number
  review: number
  rejected: number
  avgScore: number
}
interface SidebarProps {
  activeView: string
  onNavigate: (view: string) => void
  stats: SidebarStats
  className?: string
}

// StatCards
interface StatCardsProps {
  candidates: Candidate[]
  className?: string
}
```

## Key Design Decisions

1. **All components are presentational.** None of them call the API directly. The only
   side-effecting callbacks are: `onFileUploaded`, `onSelectCandidate`, `onStatusChange`,
   `onNavigate`, `onChange`/`onClear` — all passed in via props by the orchestrator page.

2. **Sidebar navigation values:** `'dashboard' | 'candidates' | 'upload' | 'analytics'`
   (lowercase). The orchestrator can use these as the `activeView` discriminator.

3. **Status type** comes from `@/lib/types` (`'REVIEW' | 'SHORTLIST' | 'REJECT'`).
   `CandidateTable` and `CandidateDetail` both call `onStatusChange(id, status)` — they
   do NOT persist; the parent must PATCH `/api/candidates/[id]` and refresh state.

4. **ScoreBadge `animateCount` prop:** defaults to `true`. The table rows pass
   `animateCount={false}` to avoid janky simultaneous count-ups when many rows render.
   Use the default (`true`) for the lg variant in `CandidateDetail`.

5. **CandidateDetail uses Sheet** (side="right"), width `540px` on desktop, full-width
   on mobile. Its `open` and `onOpenChange` are controlled by the parent. When
   `candidate` is null but the sheet is animating closed, the body just renders nothing
   (guarded by AnimatePresence).

6. **Responsive strategy:**
   - Sidebar: hidden on mobile (`hidden md:flex`), replaced by a top bar + Sheet drawer.
   - CandidateTable: full `<table>` on `md+`, stacked cards on mobile.
   - StatCards: 2-col grid on mobile, 4-col on `lg+`.
   - CandidateDetail: full width on mobile, 540px on `sm+`.

7. **Toasts:** UploadZone uses `toast({ title, description, variant })` from
   `@/hooks/use-toast` for invalid file type / oversize file errors.

8. **Color system:** strictly neon cyan `#00F0FF`, electric green `#00FF66`, amber
   `#FFB340`, red `#FF2D55`. No indigo/blue. Missing-skills in CandidateDetail are
   explicitly neon red per the task spec.

9. **Animation library:** framer-motion `motion` + `AnimatePresence` + `animate` +
   `useMotionValue` for count-ups. Used `layoutId` for the sidebar active indicator.

10. **Lint compliance:** refactored two `react-hooks/set-state-in-effect` violations:
    - `ScoreBadge`: when `animateCount` is false, we render `score` directly instead
      of syncing via setState in the effect.
    - `StatCards` `useCountUp`: removed the synchronous `setVal(0)` early-return; the
      rAF callback now animates from the current value to target (handles 0 correctly).
    `bun run lint` passes with **0 errors, 0 warnings**.

## What the Orchestrator Still Needs to Build (Task 3)

The main `src/app/page.tsx` (Task 3) will:
- Own the global state: `candidates: Candidate[]`, `jdText: string`, `activeView`,
  `selectedCandidate`, `detailOpen`.
- Wire up the API calls: `POST /api/analyze` → `POST /api/candidates` → refresh
  `GET /api/candidates`; `PATCH /api/candidates/[id]` for status changes.
- Render `<Sidebar>`, `<StatCards>`, `<UploadZone>`, `<JobDescriptionInput>`,
  `<CandidateTable>`, `<CandidateDetail>` based on `activeView`.
- Mount the `<Toaster />` from `@/components/ui/sonner` (or the existing toast
  provider — verify in layout).

## Verified

- `bun run lint` → clean (0 problems)
- Dev server compiles cleanly (`dev.log` shows no errors)
- All files use `'use client'` and TypeScript with proper types from `@/lib/types`
