// Shared types for the AI Resume ATS application

// ----- AI evaluation verdict (exact strings returned by the LLM) -----
export type Verdict = 'Strong Shortlist' | 'Potential Review' | 'Reject';

// ----- Internal pipeline status (drives the UI status pill) -----
export type CandidateStatus = 'REVIEW' | 'SHORTLIST' | 'REJECT';

/**
 * Map an AI verdict string to the internal pipeline status.
 */
export function verdictToStatus(verdict: Verdict | string | undefined): CandidateStatus {
  const v = (verdict ?? '').trim().toLowerCase();
  if (v.includes('shortlist') || v.includes('strong')) return 'SHORTLIST';
  if (v.includes('reject')) return 'REJECT';
  return 'REVIEW';
}

// ---------------------------------------------------------------------------
// AnalysisResult — EXACT JSON schema returned by the LLM via /api/analyze.
// This mirrors the rigorous ATS evaluation schema.
// ---------------------------------------------------------------------------
export interface AnalysisResult {
  candidate_name: string;
  contact: {
    email: string | null;
    phone: string | null;
    linkedin: string | null;
  };
  top_skills: string[];
  experience_summary: {
    total_years: number;
    latest_role: string;
    latest_company: string;
  };
  ats_evaluation: {
    match_score: number;
    verdict: Verdict;
    key_strengths: string[];
    missing_skills_or_gaps: string[];
    brief_summary: string;
  };
}

// ---------------------------------------------------------------------------
// Candidate — flat shape used by the DB layer and the frontend components.
// Derived from AnalysisResult when persisting.
// ---------------------------------------------------------------------------
export interface Candidate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  fileName: string;
  matchScore: number;
  status: CandidateStatus;
  verdict: Verdict;
  topSkills: string[];
  latestRole: string | null;
  latestCompany: string | null;
  experienceYears: number | null;
  keyStrengths: string[];
  missingSkills: string[];
  briefSummary: string;
  jdText: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------
export interface AnalyzeRequest {
  resumeText: string;
  jobDescription: string;
  fileName: string;
}

// The create endpoint accepts the AI AnalysisResult plus storage metadata.
export interface CreateCandidateRequest extends AnalysisResult {
  fileName: string;
  jdText: string;
  rawText: string;
}

export interface UpdateStatusRequest {
  status: CandidateStatus;
}
