import type { Candidate, CandidateStatus, Verdict } from '@/lib/types';
import { verdictToStatus } from '@/lib/types';

/**
 * Raw shape of a Candidate row as returned by Prisma (SQLite).
 * Array fields are stored as JSON strings; createdAt is a Date.
 */
interface CandidateRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  fileName: string;
  matchScore: number;
  status: string;
  verdict: string;
  topSkills: string;
  latestRole: string | null;
  latestCompany: string | null;
  experienceYears: number | null;
  keyStrengths: string;
  missingSkills: string;
  briefSummary: string;
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

function normalizeVerdict(v: string | null | undefined): Verdict {
  const s = (v ?? '').trim().toLowerCase();
  if (s.includes('strong') || s.includes('shortlist')) return 'Strong Shortlist';
  if (s.includes('reject')) return 'Reject';
  return 'Potential Review';
}

/**
 * Convert a Prisma Candidate row (with JSON-stringified array fields and a
 * Date `createdAt`) into the flat `Candidate` type expected by the frontend.
 */
export function toCandidate(row: CandidateRow): Candidate {
  const verdict = normalizeVerdict(row.verdict);
  const status: CandidateStatus =
    (row.status as CandidateStatus) ?? verdictToStatus(verdict);

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    linkedin: row.linkedin ?? null,
    fileName: row.fileName,
    matchScore: row.matchScore,
    status,
    verdict,
    topSkills: safeParseArray<string>(row.topSkills),
    latestRole: row.latestRole ?? null,
    latestCompany: row.latestCompany ?? null,
    experienceYears:
      row.experienceYears == null ? null : Number(row.experienceYears),
    keyStrengths: safeParseArray<string>(row.keyStrengths),
    missingSkills: safeParseArray<string>(row.missingSkills),
    briefSummary: row.briefSummary,
    jdText: row.jdText,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : new Date(row.createdAt).toISOString(),
  };
}
