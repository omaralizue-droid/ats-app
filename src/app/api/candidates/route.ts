import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toCandidate } from '@/lib/mappers';
import { verdictToStatus } from '@/lib/types';
import type { CreateCandidateRequest } from '@/lib/types';

const VALID_STATUSES = ['REVIEW', 'SHORTLIST', 'REJECT'];

/**
 * GET /api/candidates
 * Returns { candidates: Candidate[] } sorted by matchScore desc.
 */
export async function GET() {
  try {
    const rows = await db.candidate.findMany({
      orderBy: { matchScore: 'desc' },
    });
    const candidates = rows.map(toCandidate);
    return NextResponse.json({ candidates });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch candidates.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/candidates
 * Body: CreateCandidateRequest (the nested AnalysisResult + fileName + jdText + rawText)
 * Flattens the nested AI schema into DB columns and persists the candidate.
 * Returns { candidate: Candidate } with status 201.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | Partial<CreateCandidateRequest>
      | null;

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 },
      );
    }

    const candidateName = (body.candidate_name && String(body.candidate_name).trim()) || 'Candidate Profile';
    const contact = body.contact ?? { email: null, phone: null, linkedin: null };
    const experience = body.experience_summary ?? { total_years: 0, latest_role: '', latest_company: '' };
    const ats = body.ats_evaluation ?? {
      match_score: 0,
      verdict: 'Potential Review' as const,
      key_strengths: [],
      missing_skills_or_gaps: [],
      brief_summary: 'Candidate evaluation completed.',
    };

    const matchScore = typeof ats.match_score === 'number'
      ? Math.max(0, Math.min(100, Math.round(ats.match_score)))
      : 50;

    if (!body.fileName || typeof body.fileName !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: fileName' },
        { status: 400 },
      );
    }
    if (!body.jdText || typeof body.jdText !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: jdText' },
        { status: 400 },
      );
    }
    const briefSummary = (ats.brief_summary && String(ats.brief_summary).trim()) || 'Candidate evaluation completed.';


    // Normalize arrays with safe fallbacks.
    const topSkills = Array.isArray(body.top_skills) ? body.top_skills.slice(0, 10) : [];
    const keyStrengths = Array.isArray(ats.key_strengths) ? ats.key_strengths : [];
    const missingSkills = Array.isArray(ats.missing_skills_or_gaps)
      ? ats.missing_skills_or_gaps
      : [];

    // Derive verdict + initial pipeline status.
    const verdictStr = typeof ats.verdict === 'string' ? ats.verdict : 'Potential Review';
    const initialStatus = VALID_STATUSES.includes(
      verdictToStatus(verdictStr),
    )
      ? verdictToStatus(verdictStr)
      : 'REVIEW';

    const email = typeof contact.email === 'string' && contact.email ? contact.email : '';

    const created = await db.candidate.create({
      data: {
        name: String(candidateName),
        email,
        phone:
          typeof contact.phone === 'string' && contact.phone
            ? contact.phone
            : null,
        linkedin:
          typeof contact.linkedin === 'string' && contact.linkedin
            ? contact.linkedin
            : null,
        fileName: String(body.fileName),
        matchScore,
        status: initialStatus,
        verdict: verdictStr,
        topSkills: JSON.stringify(topSkills),
        latestRole:
          typeof experience.latest_role === 'string' && experience.latest_role
            ? experience.latest_role
            : null,
        latestCompany:
          typeof experience.latest_company === 'string' &&
          experience.latest_company
            ? experience.latest_company
            : null,
        experienceYears:
          typeof experience.total_years === 'number' && Number.isFinite(experience.total_years)
            ? experience.total_years
            : null,
        keyStrengths: JSON.stringify(keyStrengths),
        missingSkills: JSON.stringify(missingSkills),
        briefSummary: String(briefSummary),
        jdText: String(body.jdText),
        rawText:
          typeof body.rawText === 'string' && body.rawText ? body.rawText : null,
      },
    });

    return NextResponse.json(
      { candidate: toCandidate(created) },
      { status: 201 },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to create candidate.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
