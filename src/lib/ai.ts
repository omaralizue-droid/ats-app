import ZAI from 'z-ai-web-dev-sdk';
import type { AnalysisResult, Verdict } from '@/lib/types';

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) algorithm and senior technical recruiter with 15+ years of experience screening engineering, product, and design candidates.

Your task: analyze the provided Resume Text against the target Job Description (JD) and extract structured data alongside a rigorous ATS match evaluation.

CRITICAL INSTRUCTIONS:
1. You must respond ONLY with a raw, valid JSON object. Do not include markdown formatting like \`\`\`json ... \`\`\`, and do not include any introductory or concluding text.
2. Evaluate the match score critically (0-100%). Be realistic; do not give inflated scores unless the candidate truly matches the core technical requirements.
   - 90-100: exceptional, near-perfect match
   - 75-89: strong match, clearly qualified
   - 50-74: partial fit, has gaps
   - 25-49: weak fit, significant gaps
   - 0-24: poor fit
3. The verdict must be exactly one of: "Strong Shortlist" (score >= 75), "Potential Review" (50-74), or "Reject" (< 50).
4. Be strict but fair with missing_skills_or_gaps — only list technologies/requirements that are actually in the JD but absent or weak in the resume. Do not invent requirements.
5. top_skills: maximum 10 core technical or professional skills found in the resume. Normalize spellings (e.g. "React.js" -> "React", "Node.JS" -> "Node.js").
6. brief_summary: a 2-sentence crisp, high-impact review summarizing the candidate's fit for an HR executive.

OUTPUT FORMAT — return EXACTLY this JSON structure and NOTHING else:
{
  "candidate_name": "Extract full name, capitalize properly. Use 'Unknown' if missing.",
  "contact": {
    "email": "String or null",
    "phone": "String or null",
    "linkedin": "Full URL or null"
  },
  "top_skills": ["Array of maximum 10 core technical or professional skills found in the resume"],
  "experience_summary": {
    "total_years": 0.0,
    "latest_role": "Job title",
    "latest_company": "Company name"
  },
  "ats_evaluation": {
    "match_score": 0,
    "verdict": "Choose exactly one: 'Strong Shortlist', 'Potential Review', or 'Reject'",
    "key_strengths": ["Array of 3-4 bullet points detailing why they fit the JD"],
    "missing_skills_or_gaps": ["Array of key technologies or requirements mentioned in the JD but absent/weak in the resume"],
    "brief_summary": "A 2-sentence crisp high-impact review summarizing the candidate's fit for an HR executive."
  }
}`;

const USER_PROMPT_TEMPLATE = (resumeText: string, jobDescription: string) => `Analyze the following resume against the job description and return the JSON evaluation as specified.

=== JOB DESCRIPTION ===
${jobDescription}

=== RESUME TEXT ===
${resumeText}

=== END ===

Return the raw JSON object now. No markdown, no prose.`;

/**
 * Strip surrounding markdown code fences (```json ... ``` or ``` ... ```)
 * and any leading/trailing non-JSON noise so we can JSON.parse it.
 */
function extractJson(raw: string): string {
  let text = raw.trim();

  // Remove leading/trailing prose by locating the first '{' and last '}'.
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  // Strip markdown code fences if somehow still present.
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  return text.trim();
}

const VALID_VERDICTS: Verdict[] = [
  'Strong Shortlist',
  'Potential Review',
  'Reject',
];

function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (v == null) return fallback;
  return String(v);
}

function nullableStr(v: unknown): string | null {
  if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  return null;
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fallback;
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === 'string' ? x : String(x)))
    .filter((s) => s.trim().length > 0);
}

/**
 * Validate and normalize the parsed JSON into a strict AnalysisResult.
 * Tolerant of minor shape deviations from the LLM but always returns a
 * well-formed object.
 */
function ensureValidResult(parsed: unknown): AnalysisResult {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response was not a JSON object.');
  }
  const obj = parsed as Record<string, unknown>;

  const contactRaw =
    (obj.contact as Record<string, unknown> | undefined) ?? {};
  const expRaw =
    (obj.experience_summary as Record<string, unknown> | undefined) ?? {};
  const atsRaw =
    (obj.ats_evaluation as Record<string, unknown> | undefined) ?? {};

  // Verdict — coerce to one of the three canonical values.
  let verdict: Verdict = 'Potential Review';
  const verdictRaw = str(atsRaw.verdict).trim();
  const verdictLower = verdictRaw.toLowerCase();
  if (verdictLower.includes('strong') || verdictLower.includes('shortlist')) {
    verdict = 'Strong Shortlist';
  } else if (verdictLower.includes('reject')) {
    verdict = 'Reject';
  } else if (
    VALID_VERDICTS.includes(verdictRaw as Verdict) ||
    verdictLower.includes('review')
  ) {
    verdict = 'Potential Review';
  }

  // matchScore clamped 0-100, rounded to integer.
  const matchScore = Math.max(
    0,
    Math.min(100, Math.round(num(atsRaw.match_score, 0))),
  );

  // Derive verdict from score if the LLM gave an inconsistent verdict.
  let finalVerdict = verdict;
  if (matchScore >= 75 && verdict === 'Reject') finalVerdict = 'Strong Shortlist';
  else if (matchScore < 50 && verdict === 'Strong Shortlist') finalVerdict = 'Reject';
  else if (matchScore >= 50 && matchScore < 75 && verdict === 'Strong Shortlist')
    finalVerdict = 'Potential Review';
  else if (matchScore >= 75 && verdict === 'Potential Review')
    finalVerdict = 'Strong Shortlist';

  // top_skills — cap at 10.
  const topSkills = strArr(obj.top_skills).slice(0, 10);

  const totalYears = num(expRaw.total_years, 0);

  return {
    candidate_name: str(obj.candidate_name, 'Unknown'),
    contact: {
      email: nullableStr(contactRaw.email),
      phone: nullableStr(contactRaw.phone),
      linkedin: nullableStr(contactRaw.linkedin),
    },
    top_skills: topSkills,
    experience_summary: {
      total_years: totalYears,
      latest_role: str(expRaw.latest_role, ''),
      latest_company: str(expRaw.latest_company, ''),
    },
    ats_evaluation: {
      match_score: matchScore,
      verdict: finalVerdict,
      key_strengths: strArr(atsRaw.key_strengths),
      missing_skills_or_gaps: strArr(atsRaw.missing_skills_or_gaps),
      brief_summary: str(
        atsRaw.brief_summary,
        'No summary available.',
      ),
    },
  };
}

/**
 * Analyze a resume against a job description using the ZAI LLM.
 * Returns a strictly-validated AnalysisResult matching the rigorous ATS schema.
 * Throws Error with a clear message if the LLM call or JSON parse fails.
 */
export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
): Promise<AnalysisResult> {
  if (!resumeText || !resumeText.trim()) {
    throw new Error('Resume text is required for analysis.');
  }
  if (!jobDescription || !jobDescription.trim()) {
    throw new Error('Job description is required for analysis.');
  }

  let zai: Awaited<ReturnType<typeof ZAI.create>>;
  try {
    zai = await ZAI.create();
  } catch (err) {
    throw new Error(
      `Failed to initialize AI client: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  let content: string | undefined;
  try {
    const completion = await zai.chat.completions.create({
      model: 'glm-4-flash',
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT_TEMPLATE(resumeText, jobDescription) },
      ],
      thinking: { type: 'disabled' },
    });
    content = completion.choices[0]?.message?.content;
  } catch (err) {
    throw new Error(
      `AI completion request failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!content || !content.trim()) {
    throw new Error('AI returned an empty response.');
  }

  const jsonText = extractJson(content);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(
      `Failed to parse AI response as JSON: ${err instanceof Error ? err.message : String(err)}. Raw response started with: "${content.slice(0, 200)}"`,
    );
  }

  return ensureValidResult(parsed);
}
