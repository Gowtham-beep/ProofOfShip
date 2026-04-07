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
  const llmResult = await getLLMInsights(repo, signals, {
    comprehensionHealth,
    hallucinationDebt,
    architecturalConsistency,
    debtTrajectory,
  });

  // Apply LLM comprehension adjustment
  const { comprehensionScoreAdjustment, ...llmInsights } = llmResult;
  const adjustedComprehensionHealth = clamp(comprehensionHealth + comprehensionScoreAdjustment);

  // 5. Weighted final score
  const rawScore =
    adjustedComprehensionHealth * 0.30 +
    hallucinationDebt * 0.25 +
    architecturalConsistency * 0.20 +
    debtTrajectory * 0.15 +
    complexityAdjustment * 0.10;

  const score = clamp(Math.round(rawScore));

  const breakdown: ScoreBreakdown = {
    comprehensionHealth: adjustedComprehensionHealth,
    hallucinationDebt,
    architecturalConsistency,
    debtTrajectory,
    complexityAdjustment,
    complexityTier: tier,
    signals,
    llmInsights,
  };

  return {
    repoId: repo.id,
    userId: repo.userId,
    score,
    breakdown,
    percentile: null,
    version: 1,
    createdAt: new Date().toISOString(),
  };
}
