# Task 2-a — Backend API routes for NeonATS

## Agent
full-stack-developer

## Task scope
Build the backend API routes for NeonATS:
- `src/lib/ai.ts` — `analyzeResume()` helper using z-ai-web-dev-sdk
- `src/app/api/analyze/route.ts` — POST /api/analyze
- `src/app/api/candidates/route.ts` — GET list + POST create
- `src/app/api/candidates/[id]/route.ts` — PATCH status + DELETE
- `src/lib/mappers.ts` — shared `toCandidate(row)` row->type mapper

## Files created
1. `src/lib/mappers.ts` — `toCandidate(row: CandidateRow): Candidate`
2. `src/lib/ai.ts` — `analyzeResume(resumeText, jobDescription): Promise<AnalysisResult>`
3. `src/app/api/analyze/route.ts` — POST handler
4. `src/app/api/candidates/route.ts` — GET + POST handlers
5. `src/app/api/candidates/[id]/route.ts` — PATCH + DELETE handlers

## Implementation summary

### `src/lib/mappers.ts`
- Exports `toCandidate(row)` that converts a Prisma Candidate row into the frontend `Candidate` type.
- `safeParseArray()` parses JSON-stringified array fields with `[]` fallback on parse failure / empty / non-array.
- The `skills` field is tolerant of both `string[]` and `ParsedSkill[]` shapes (extracts `.name`).
- `createdAt` Date -> ISO string. `status` cast to `CandidateStatus`.

### `src/lib/ai.ts`
- Detailed SYSTEM_PROMPT instructs the LLM to act as expert technical recruiter + ATS parser.
  - Parse name/email/phone from resume.
  - Extract + normalize all technical/professional skills.
  - Compare against JD: matchedSkills / missingSkills / skills[].matched.
  - Compute realistic matchScore 0-100 (no defaulting to 70-80).
  - Recommendation: SHORTLIST>=75, REVIEW 50-74, REJECT<50.
  - 3-5 strengths, 3-5 weaknesses, experienceYears, currentRole, 2-3 sentence summary.
  - STRICT JSON ONLY, no markdown fences, no prose.
- Calls `ZAI.create()` then `zai.chat.completions.create({ messages, thinking: { type: 'disabled' } })`.
- `extractJson()` strips markdown fences + slices to outermost `{ ... }`.
- `ensureValidResult()` defensively validates/coerces every field (clamps matchScore, validates recommendation enum, coerces arrays/numbers/strings).
- Throws Error with clear messages on: SDK init failure, completion failure, empty response, JSON parse failure.

### `src/app/api/analyze/route.ts`
- POST: validates resumeText + jobDescription are non-empty strings (400 otherwise).
- Calls `analyzeResume()`. Returns `{ result, fileName }` on success, 500 `{ error }` on failure.
- Wrapped in try/catch.

### `src/app/api/candidates/route.ts`
- GET: `db.candidate.findMany({ orderBy: { matchScore: 'desc' } })`, maps via `toCandidate`, returns `{ candidates }`.
- POST: validates required scalar fields + matchScore range, normalizes recommendation -> initial status, JSON.stringify's the 5 array fields, creates row, returns `{ candidate }` with 201.
- Try/catch -> 500 (400 for validation errors).

### `src/app/api/candidates/[id]/route.ts`
- Uses Next.js 16 async-params pattern: `params: Promise<{ id: string }>`.
- PATCH: validates `status` against CandidateStatus enum (400 if invalid), 404 if not found, else updates + returns `{ candidate }`.
- DELETE: 404 if not found, else deletes + returns `{ success: true }`.
- Try/catch -> 500.

## Verification
- `bun run lint` on my files: clean (no errors/warnings).
- `tsc --noEmit`: no errors in any of my files (the 4 reported TS errors are all in unrelated `examples/` and `skills/` dirs, pre-existing).
- dev.log: server healthy, all routes returning 200.

## Notes for downstream agents
- The `toCandidate` mapper is the single source of truth for DB row -> frontend Candidate conversion. Reuse it for any future candidate-detail route.
- The DB `skills` field stores `ParsedSkill[]` (objects with `{name, matched}`) as a JSON string. The frontend `Candidate.skills` is typed `string[]`, and the mapper extracts `.name` automatically. If a future detail view needs the `matched` flags, consider adding a separate field or exposing a `parsedSkills` accessor.
- The AI response is double-validated (JSON parse + defensive shape coercion), so downstream code can trust the `AnalysisResult` shape.
- Initial candidate `status` on creation = AI's `recommendation`. Status is then mutable via PATCH.
- The leftover template `src/app/api/route.ts` (Hello World) was intentionally left untouched (out of scope).
