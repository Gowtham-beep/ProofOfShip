import type { RepoRecord, ComplexityTier, ScoreBreakdown } from '@proofofship/types';

type Signals = ScoreBreakdown['signals'];

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function scoreComprehensionHealth(
  repo: RepoRecord,
  signals: Signals,
): number {
  let score = 50;

  if (signals.hasDocs) score += 15;
  if ((repo.description ?? '').length > 50) score += 15;
  if (signals.hasTests) score += 10;
  if (
    signals.primaryLanguage === 'TypeScript' ||
    signals.primaryLanguage === 'Python'
  ) score += 10;
  if (signals.commitVelocity === 'dead') score -= 10;
  if (signals.languageCount > 4) score -= 5;

  return clamp(score);
}

export function scoreHallucinationDebt(
  repo: RepoRecord,
  signals: Signals,
): number {
  let score = 70;

  if (signals.hasTests) score += 15;
  if (signals.primaryLanguage === 'TypeScript') score += 10;
  if (repo.isFork) score -= 20;
  if (signals.commitVelocity === 'dead') score -= 10;
  if (signals.languageCount > 4) score -= 5;

  return clamp(score);
}

export function scoreArchitecturalConsistency(
  repo: RepoRecord,
  signals: Signals,
): number {
  let score = 60;

  if (signals.hasCI) score += 20;
  if (signals.hasTests) score += 10;
  if (signals.languageCount === 1) score += 10;
  if (signals.languageCount > 3) score -= 10;
  if (repo.isFork) score -= 15;
  if (signals.commitVelocity === 'dead') score -= 10;

  return clamp(score);
}

export function scoreDebtTrajectory(
  repo: RepoRecord,
  signals: Signals,
): number {
  let score = 50;

  const velocityBonus: Record<Signals['commitVelocity'], number> = {
    active: 30,
    moderate: 15,
    stale: 0,
    dead: -20,
  };
  score += velocityBonus[signals.commitVelocity];

  if (signals.hasTests) score += 10;
  if (signals.hasCI) score += 10;

  return clamp(score);
}

export function scoreComplexityAdjustment(tier: ComplexityTier): number {
  const tierScores: Record<ComplexityTier, number> = {
    trivial: 40,
    simple: 55,
    moderate: 70,
    complex: 85,
    advanced: 100,
  };
  return tierScores[tier];
}
