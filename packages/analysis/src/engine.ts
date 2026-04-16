import type { RepoRecord, ProofOfShipScore, ScoreBreakdown } from '@proofofship/types';
import { computeComplexityTier, extractSignals } from './complexity.js';
import {
  scoreComprehensionHealth,
  scoreHallucinationDebt,
  scoreArchitecturalConsistency,
  scoreDebtTrajectory,
  scoreComplexityAdjustment,
} from './scorer.js';
import { getLLMInsights } from './llm.js';

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export async function analyzeRepo(repo: RepoRecord): Promise<ProofOfShipScore> {
  // 1. Complexity tier
  const tier = computeComplexityTier(repo);

  // 2. Signals
  const signals = extractSignals(repo);

  // 3. Deterministic sub-scores
  const comprehensionHealth = scoreComprehensionHealth(repo, signals);
  const hallucinationDebt = scoreHallucinationDebt(repo, signals);
  const architecturalConsistency = scoreArchitecturalConsistency(repo, signals);
  const debtTrajectory = scoreDebtTrajectory(repo, signals);
  const complexityAdjustment = scoreComplexityAdjustment(tier);

  // 4. LLM insights (never throws)
  const llmResult = await getLLMInsights(repo, signals, tier, {
    comprehensionHealth,
    hallucinationDebt,
    architecturalConsistency,
    debtTrajectory,
    complexityAdjustment,
  });

  const { scoreAdjustment, ...llmInsights } = llmResult;

  // 5. Base Score calculation (Deterministic)
  // Weighted average of static analysis components
  const baseScore =
    comprehensionHealth * 0.30 +
    hallucinationDebt * 0.25 +
    architecturalConsistency * 0.20 +
    debtTrajectory * 0.15 +
    complexityAdjustment * 0.10;

  // 6. Final Score with LLM Adjustment
  // Base score is already [0, 100]. LLM adjustment is [-5, +5].
  const finalScore = clamp(Math.round(baseScore + scoreAdjustment));

  const breakdown: ScoreBreakdown = {
    comprehensionHealth,
    hallucinationDebt,
    architecturalConsistency,
    debtTrajectory,
    complexityAdjustment,
    complexityTier: tier,
    signals,
    llmInsights: {
      ...llmInsights,
      // We can still store the adjustment in the breakdown if needed, 
      // but let's keep it clean for now as per instructions.
    },
  };

  return {
    repoId: repo.id,
    userId: repo.userId,
    commitHash: repo.pushedAt || undefined,
    score: finalScore,
    breakdown,
    percentile: null,
    version: 1,
    createdAt: new Date().toISOString(),
  };
}
