import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/ai';
import { parseFileToText } from '@/lib/parse-document';

/**
 * POST /api/analyze
 *
 * Accepts `multipart/form-data` with:
 *   - file: File (PDF, DOCX, DOC, or TXT)
 *   - jobDescription: string
 *
 * Parses the uploaded document to plain text, runs the AI ATS evaluation,
 * and returns:
 *   { result: AnalysisResult, extractedText: string, fileName: string }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null);

    if (!formData) {
      return NextResponse.json(
        { error: 'Expected multipart/form-data with a file and jobDescription.' },
        { status: 400 },
      );
    }

    const file = formData.get('file');
    const jobDescription = formData.get('jobDescription');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'A resume file is required.' },
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

    // 1. Parse the uploaded document into plain text.
    let parsed;
    try {
      parsed = await parseFileToText(file);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : 'Failed to parse the uploaded file.',
        },
        { status: 400 },
      );
    }

    if (!parsed.text || parsed.text.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            'Could not extract any text from the uploaded file. If it is a scanned PDF, please upload a text-based version.',
        },
        { status: 400 },
      );
    }

    // 2. Run the AI ATS evaluation.
    const result = await analyzeResume(parsed.text, jobDescription);

    return NextResponse.json({
      result,
      extractedText: parsed.text,
      fileName: parsed.fileName,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unexpected error during analysis.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
