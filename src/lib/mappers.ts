import type { Candidate, CandidateStatus, ParsedSkill } from '@/lib/types';

/**
 * Raw shape of a Candidate row as returned by Prisma (SQLite).
 * Array fields are stored as JSON strings; createdAt is a Date.
 */
interface CandidateRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  fileName: string;
  matchScore: number;
  status: string;
  skills: string;
  matchedSkills: string;
  missingSkills: string;
  strengths: string;
  weaknesses: string;
  summary: string;
  experienceYears: number | null;
  currentRole: string | null;
  jdText: string;
  rawText: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function safeParseArray<T = string>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== 'string' || value.trim().length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/**
 * Convert a Prisma Candidate row (with JSON-stringified array fields and a
 * Date `createdAt`) into the `Candidate` type expected by the frontend.
 *
 * NOTE: The `skills` field in the DB stores a `ParsedSkill[]` array, but the
 * frontend `Candidate.skills` is typed as `string[]` (just skill names). We
 * handle both shapes gracefully: if we detect ParsedSkill objects we extract
 * their `.name` values.
 */
export function toCandidate(row: CandidateRow): Candidate {
  const rawSkills = safeParseArray<ParsedSkill | string>(row.skills);
  const skills: string[] = rawSkills.map((s) =>
    typeof s === 'string' ? s : (s?.name ?? String(s)),
  );

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    fileName: row.fileName,
    matchScore: row.matchScore,
    status: (row.status as CandidateStatus) ?? 'REVIEW',
    skills,
    matchedSkills: safeParseArray<string>(row.matchedSkills),
    missingSkills: safeParseArray<string>(row.missingSkills),
    strengths: safeParseArray<string>(row.strengths),
    weaknesses: safeParseArray<string>(row.weaknesses),
    summary: row.summary,
    experienceYears: row.experienceYears ?? null,
    currentRole: row.currentRole ?? null,
    jdText: row.jdText,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
  };
}
