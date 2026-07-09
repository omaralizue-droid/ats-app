import ZAI from 'z-ai-web-dev-sdk';
import type { AnalysisResult, CandidateStatus, ParsedSkill } from '@/lib/types';

const SYSTEM_PROMPT = `You are an expert technical recruiter and Applicant Tracking System (ATS) parser with 15+ years of experience screening engineering, product, and design candidates. You have deep knowledge of modern tech stacks, role seniority markers, and what hiring managers actually care about.

Your job: given a candidate's resume (plain text) and a job description, produce a rigorous, realistic evaluation.

You MUST follow these rules:

1. PARSE CONTACT INFO
   - Extract the candidate's full name. If you truly cannot determine it, use "Unknown Candidate".
   - Extract the primary email address. If none, use "".
   - Extract the primary phone number (digits, +, spaces, dashes, parentheses ok). If none, use "".

2. EXTRACT SKILLS
   - Identify ALL technical and professional skills mentioned ANYWHERE in the resume (technologies, languages, frameworks, tools, methodologies, platforms, soft skills relevant to the role).
   - Normalize skill names (e.g. "React.js" -> "React", "Node.JS" -> "Node.js", "PostgreSQL" -> "Postgres"). Use canonical, widely-recognized spellings.
   - Each skill is an object { "name": string, "matched": boolean }. "matched" is true if that skill is explicitly required OR clearly implied by the job description.

3. COMPARE AGAINST THE JOB DESCRIPTION
   - matchedSkills: skills that appear in BOTH the resume and the job description's requirements.
   - missingSkills: skills required/implied by the job description that are NOT in the resume.
   - Be strict but fair — don't invent missing skills that aren't actually in the JD.

4. COMPUTE matchScore (integer 0-100)
   - Base it on: skill overlap (most important), experience relevance, seniority alignment, and keyword density.
   - Do NOT default to 70-80. Be honest:
     * 90-100: exceptional, near-perfect match
     * 75-89: strong match, clearly qualified
     * 50-74: partial fit, has gaps
     * 25-49: weak fit, significant gaps
     * 0-24: poor fit
   - Apply critical judgment. If the candidate is clearly missing multiple core required skills, the score should reflect that.

5. recommendation (one of "SHORTLIST", "REVIEW", "REJECT")
   - SHORTLIST if matchScore >= 75
   - REVIEW if 50 <= matchScore <= 74
   - REJECT if matchScore < 50

6. strengths: 3-5 bullet strings. Concrete positives relative to the JD (e.g. "5+ years of React experience exceeds the 3-year requirement").

7. weaknesses: 3-5 bullet strings. Concrete gaps or concerns relative to the JD (e.g. "No mention of AWS, which is listed as a required skill").

8. experienceYears: integer. Best estimate of total relevant professional experience based on dates, roles, and any stated totals. 0 if undeterminable.

9. currentRole: the candidate's most recent / current job title. null/empty string if unknown.

10. summary: a concise 2-3 sentence verdict explaining the recommendation. Mention the matchScore, key strengths, and main gaps. Direct and professional — no fluff.

OUTPUT FORMAT — STRICT JSON ONLY:
Return EXACTLY one JSON object with these keys and NOTHING else. No markdown fences, no prose before or after, no comments:
{
  "name": string,
  "email": string,
  "phone": string,
  "matchScore": number,
  "skills": [{ "name": string, "matched": boolean }],
  "matchedSkills": string[],
  "missingSkills": string[],
  "strengths": string[],
  "weaknesses": string[],
  "experienceYears": number,
  "currentRole": string,
  "summary": string,
  "recommendation": "SHORTLIST" | "REVIEW" | "REJECT"
}

CRITICAL: Output the JSON object and absolutely nothing else.`;

const USER_PROMPT_TEMPLATE = (resumeText: string, jobDescription: string) => `Please analyze the following resume against the job description and return the JSON evaluation as specified.

=== JOB DESCRIPTION ===
${jobDescription}

=== RESUME ===
${resumeText}

=== END ===

Return the STRICT JSON object now.`;

/**
 * Strip surrounding markdown code fences (```json ... ``` or ``` ... ```)
 * and any leading/trailing whitespace/non-JSON noise so we can JSON.parse it.
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

function ensureValidResult(parsed: unknown): AnalysisResult {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response was not a JSON object.');
  }
  const obj = parsed as Record<string, unknown>;

  const str = (v: unknown, fallback = ''): string =>
    typeof v === 'string' ? v : v == null ? fallback : String(v);

  const num = (v: unknown, fallback = 0): number => {
    const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const strArr = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.map((x) => (typeof x === 'string' ? x : String(x))).filter(Boolean)
      : [];

  const skillsArr = (v: unknown): ParsedSkill[] => {
    if (!Array.isArray(v)) return [];
    return v
      .map((item) => {
        if (typeof item === 'string') {
          return { name: item, matched: false } satisfies ParsedSkill;
        }
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>;
          return {
            name: str(o.name),
            matched: Boolean(o.matched),
          } satisfies ParsedSkill;
        }
        return null;
      })
      .filter((s): s is ParsedSkill => s !== null && s.name.length > 0);
  };

  const recRaw = str(obj.recommendation, 'REVIEW').toUpperCase();
  const validRec: CandidateStatus[] = ['SHORTLIST', 'REVIEW', 'REJECT'];
  const recommendation: CandidateStatus = validRec.includes(recRaw as CandidateStatus)
    ? (recRaw as CandidateStatus)
    : 'REVIEW';

  const matchScore = Math.max(0, Math.min(100, num(obj.matchScore, 0)));

  return {
    name: str(obj.name, 'Unknown Candidate'),
    email: str(obj.email),
    phone: str(obj.phone),
    matchScore,
    skills: skillsArr(obj.skills),
    matchedSkills: strArr(obj.matchedSkills),
    missingSkills: strArr(obj.missingSkills),
    strengths: strArr(obj.strengths),
    weaknesses: strArr(obj.weaknesses),
    experienceYears: num(obj.experienceYears, 0),
    currentRole: str(obj.currentRole),
    summary: str(obj.summary, 'No summary provided.'),
    recommendation,
  };
}

/**
 * Analyze a resume against a job description using the ZAI LLM.
 * Returns a strictly-validated AnalysisResult.
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
