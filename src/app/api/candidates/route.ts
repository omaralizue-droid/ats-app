import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toCandidate } from '@/lib/mappers';
import type { CandidateStatus, CreateCandidateRequest } from '@/lib/types';

const VALID_STATUSES: CandidateStatus[] = ['REVIEW', 'SHORTLIST', 'REJECT'];

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
 * Body: CreateCandidateRequest (AnalysisResult + fileName + jdText + rawText)
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

    // Validate required scalar fields.
    const requiredFields: (keyof CreateCandidateRequest)[] = [
      'name',
      'email',
      'matchScore',
      'summary',
      'fileName',
      'jdText',
    ];
    for (const key of requiredFields) {
      const v = body[key];
      if (v === undefined || v === null || v === '') {
        return NextResponse.json(
          { error: `Missing required field: ${String(key)}` },
          { status: 400 },
        );
      }
    }

    if (
      typeof body.matchScore !== 'number' ||
      body.matchScore < 0 ||
      body.matchScore > 100
    ) {
      return NextResponse.json(
        { error: 'matchScore must be a number between 0 and 100.' },
        { status: 400 },
      );
    }

    // Normalize recommendation -> initial status (fall back to REVIEW).
    const rec = (typeof body.recommendation === 'string'
      ? body.recommendation.toUpperCase()
      : 'REVIEW') as CandidateStatus;
    const initialStatus: CandidateStatus = VALID_STATUSES.includes(rec)
      ? rec
      : 'REVIEW';

    // Normalize arrays with safe fallbacks.
    const skills = Array.isArray(body.skills) ? body.skills : [];
    const matchedSkills = Array.isArray(body.matchedSkills)
      ? body.matchedSkills
      : [];
    const missingSkills = Array.isArray(body.missingSkills)
      ? body.missingSkills
      : [];
    const strengths = Array.isArray(body.strengths) ? body.strengths : [];
    const weaknesses = Array.isArray(body.weaknesses) ? body.weaknesses : [];

    const created = await db.candidate.create({
      data: {
        name: String(body.name),
        email: String(body.email),
        phone: typeof body.phone === 'string' && body.phone ? body.phone : null,
        fileName: String(body.fileName),
        matchScore: Math.round(body.matchScore),
        status: initialStatus,
        skills: JSON.stringify(skills),
        matchedSkills: JSON.stringify(matchedSkills),
        missingSkills: JSON.stringify(missingSkills),
        strengths: JSON.stringify(strengths),
        weaknesses: JSON.stringify(weaknesses),
        summary: String(body.summary),
        experienceYears:
          typeof body.experienceYears === 'number'
            ? Math.round(body.experienceYears)
            : null,
        currentRole:
          typeof body.currentRole === 'string' && body.currentRole
            ? body.currentRole
            : null,
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
