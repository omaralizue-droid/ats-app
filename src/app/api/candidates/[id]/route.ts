import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toCandidate } from '@/lib/mappers';
import type { CandidateStatus } from '@/lib/types';

const VALID_STATUSES: CandidateStatus[] = ['REVIEW', 'SHORTLIST', 'REJECT'];

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

async function getParamId(ctx: RouteContext): Promise<string> {
  const params = await ctx.params;
  return params.id;
}

/**
 * PATCH /api/candidates/[id]
 * Body: { status: CandidateStatus }
 * Returns { candidate: Candidate }. 404 if not found.
 */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const id = await getParamId(ctx);

    const body = await req.json().catch(() => null);
    if (!body || typeof body.status !== 'string') {
      return NextResponse.json(
        { error: 'Request body must include a "status" string.' },
        { status: 400 },
      );
    }

    const newStatus = body.status.toUpperCase() as CandidateStatus;
    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status "${body.status}". Must be one of: ${VALID_STATUSES.join(', ')}.`,
        },
        { status: 400 },
      );
    }

    const existing = await db.candidate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: `Candidate with id "${id}" not found.` },
        { status: 404 },
      );
    }

    const updated = await db.candidate.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({ candidate: toCandidate(updated) });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to update candidate.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/candidates/[id]
 * Returns { success: true, id }. 404 if not found.
 */
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const id = await getParamId(ctx);
    if (!id) {
      return NextResponse.json({ error: 'Candidate ID parameter missing.' }, { status: 400 });
    }

    const existing = await db.candidate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: `Candidate with id "${id}" not found.` },
        { status: 404 },
      );
    }

    await db.candidate.delete({ where: { id } });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to delete candidate.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
