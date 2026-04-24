
import type { RepoRecord, ScoreBreakdown, ComplexityTier } from '@proofofship/types';

type Signals = ScoreBreakdown['signals'];
type LLMInsights = ScoreBreakdown['llmInsights'];

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 30_000;

const SAFE_DEFAULTS: LLMInsights = {
  comprehensionSummary: 'Analysis unavailable',
  hallucinationRisk: 'medium',
  architectureNotes: 'Analysis unavailable',
  improvementSuggestions: [],
  techStackInsights: 'Analysis unavailable',
  maintenanceRisk: 'unknown',
  scalabilityAssessment: 'Analysis unavailable',
};

async function callGemini(model: string, prompt: string, apiKey?: string): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${GEMINI_BASE}/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({

        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini ${model} HTTP ${res.status}: ${body}`);
    }

    const data = (await res.json()) as any;
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    // Strip markdown fences before returning
    return text.replace(/```json|```/g, '').trim();
  } finally {
    clearTimeout(timer);
  }
}

export async function getLLMInsights(
  repo: RepoRecord,
  signals: Signals,
  complexityTier: ComplexityTier,
  deterministicScores: {
    comprehensionHealth: number;
    hallucinationDebt: number;
    architecturalConsistency: number;
    debtTrajectory: number;
    complexityAdjustment: number;
  },
  config?: { apiKey?: string; model?: string }
): Promise<LLMInsights & { scoreAdjustment: number }> {
  try {
    const flashModel = config?.model || 'gemini-2.5-flash';
    const proModel = config?.model || 'gemini-2.5-pro';

    // ── Step A: gemini-2.5-flash for hallucination risk ───────────────────────
    const flashPrompt = `You are a code quality analyzer. Based on this repo metadata, classify the hallucination risk of AI-generated code.

Repo: ${repo.fullName}
Language: ${repo.language}
Topics: ${(repo.topics ?? []).join(', ')}
Size: ${repo.sizeKb}kb
Has tests: ${signals.hasTests}
Is fork: ${repo.isFork}
Hallucination debt score (deterministic): ${deterministicScores.hallucinationDebt}

Respond with ONLY a JSON object, no markdown, no explanation:
{
  "risk": "low" | "medium" | "high",
  "reason": "one sentence explanation"
}`;

    const flashRaw = await callGemini(flashModel, flashPrompt, config?.apiKey);
    const flashResult = JSON.parse(flashRaw) as {
      risk: 'low' | 'medium' | 'high';
      reason: string;
    };

    // ── Step B: gemini-2.5-pro for deep comprehension analysis ────────────────
    const proPrompt = `You are a senior engineer reviewing a codebase for comprehension quality and architectural health.

Repo: ${repo.fullName}
Description: ${repo.description ?? 'none'}
Primary language: ${repo.language}
All languages: ${JSON.stringify(repo.languages ?? {})}
Topics: ${(repo.topics ?? []).join(', ')}
Size: ${repo.sizeKb}kb
Stars: ${repo.stargazersCount}
Forks: ${repo.forksCount}
Open Issues: ${repo.openIssuesCount}
Has tests: ${signals.hasTests}
Has docs: ${signals.hasDocs}
Has CI: ${signals.hasCI}
Commit velocity: ${signals.commitVelocity}
Complexity tier: ${complexityTier}
Deterministic sub-scores:
  Comprehension health: ${deterministicScores.comprehensionHealth}
  Hallucination debt: ${deterministicScores.hallucinationDebt}
  Architectural consistency: ${deterministicScores.architecturalConsistency}
  Debt trajectory: ${deterministicScores.debtTrajectory}
  Complexity adjustment: ${deterministicScores.complexityAdjustment}

Based on this metadata, provide a comprehensive quality assessment and a final score adjustment.

Respond with ONLY a JSON object, no markdown, no explanation:
{
  "comprehensionSummary": "2-3 sentence assessment of how understandable this codebase likely is",
  "architectureNotes": "1-2 sentences on architectural consistency signals",
  "techStackInsights": "1-2 sentences about the tech stack choices and their appropriateness",
  "maintenanceRisk": "1-2 sentences on the maintenance health and future risks (consider velocity, issues)",
  "scalabilityAssessment": "1-2 sentences on how well this project might scale based on signals",
  "improvementSuggestions": [
    "specific actionable suggestion 1",
    "specific actionable suggestion 2",
    "specific actionable suggestion 3"
  ],
  "scoreAdjustment": 0
}`;

    const proRaw = await callGemini(proModel, proPrompt, config?.apiKey);
    const proResult = JSON.parse(proRaw) as {
      comprehensionSummary: string;
      architectureNotes: string;
      techStackInsights: string;
      maintenanceRisk: string;
      scalabilityAssessment: string;
      improvementSuggestions: string[];
      scoreAdjustment: number;
    };

    // ── Step C: Combine ───────────────────────────────────────────────────────
    // Strictly clamp adjustment between -5 and +5
    const adjustment = Math.max(-5, Math.min(5, proResult.scoreAdjustment ?? 0));

    return {
      comprehensionSummary: proResult.comprehensionSummary,
      hallucinationRisk: flashResult.risk,
      architectureNotes: proResult.architectureNotes,
      techStackInsights: proResult.techStackInsights,
      maintenanceRisk: proResult.maintenanceRisk,
      scalabilityAssessment: proResult.scalabilityAssessment,
      improvementSuggestions: proResult.improvementSuggestions ?? [],
      scoreAdjustment: adjustment,
    };
  } catch (err) {
    console.error('[LLM] getLLMInsights failed, using safe defaults:', (err as Error).message);
    return { ...SAFE_DEFAULTS, scoreAdjustment: 0 };
  }
}
