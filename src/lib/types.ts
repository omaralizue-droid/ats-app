// Shared types for the AI Resume ATS application

export type CandidateStatus = 'REVIEW' | 'SHORTLIST' | 'REJECT';

export interface ParsedSkill {
  name: string;
  matched: boolean;
}

export interface AnalysisResult {
  name: string;
  email: string;
  phone: string;
  matchScore: number;
  skills: ParsedSkill[];
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  experienceYears: number;
  currentRole: string;
  summary: string;
  recommendation: CandidateStatus;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  fileName: string;
  matchScore: number;
  status: CandidateStatus;
  skills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  summary: string;
  experienceYears: number | null;
  currentRole: string | null;
  jdText: string;
  createdAt: string;
}

// Request payloads
export interface AnalyzeRequest {
  resumeText: string;
  jobDescription: string;
  fileName: string;
}

export interface CreateCandidateRequest extends AnalysisResult {
  fileName: string;
  jdText: string;
  rawText: string;
}

export interface UpdateStatusRequest {
  status: CandidateStatus;
}
