import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/ai';

/**
 * POST /api/analyze
 * Body: { resumeText: string, jobDescription: string, fileName: string }
 * Returns: { result: AnalysisResult } | { error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 },
      );
    }

    const { resumeText, jobDescription, fileName } = body as {
      resumeText?: unknown;
      jobDescription?: unknown;
      fileName?: unknown;
    };

    if (typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: 'resumeText is required and must be a non-empty string.' },
        { status: 400 },
      );
    }

    if (
      typeof jobDescription !== 'string' ||
      jobDescription.trim().length === 0
    ) {
      return NextResponse.json(
        { error: 'jobDescription is required and must be a non-empty string.' },
        { status: 400 },
      );
    }

    // fileName is optional but recommended; we don't hard-validate it here.
    const safeFileName =
      typeof fileName === 'string' && fileName.trim().length > 0
        ? fileName
        : 'resume.txt';

    const result = await analyzeResume(resumeText, jobDescription);

    return NextResponse.json({
      result,
      fileName: safeFileName,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unexpected error during analysis.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
