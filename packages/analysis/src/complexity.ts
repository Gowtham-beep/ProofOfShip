import type { RepoRecord, ComplexityTier, ScoreBreakdown } from '@proofofship/types';

const ADVANCED_TOPICS = [
  'machine-learning', 'ai', 'blockchain', 'distributed-systems',
  'microservices', 'compiler', 'operating-system',
];

const COMPLEX_TOPICS = [
  'api', 'backend', 'fullstack', 'payments', 'auth', 'realtime',
];

const MODERATE_TOPICS = [
  'web', 'mobile', 'cli', 'library', 'framework',
];

export function computeComplexityTier(repo: RepoRecord): ComplexityTier {
  const topics = repo.topics ?? [];
  const languageCount = Object.keys(repo.languages ?? {}).length;
  const sizeKb = repo.sizeKb ?? 0;

  // Advanced
  if (
    sizeKb > 10000 ||
    languageCount >= 5 ||
    topics.some(t => ADVANCED_TOPICS.includes(t))
  ) {
    return 'advanced';
  }

  // Complex
  if (
    sizeKb > 3000 ||
    languageCount >= 3 ||
    topics.some(t => COMPLEX_TOPICS.includes(t))
  ) {
    return 'complex';
  }

  // Moderate
  if (
    sizeKb > 500 ||
    languageCount >= 2 ||
    topics.some(t => MODERATE_TOPICS.includes(t))
  ) {
    return 'moderate';
  }

  // Simple
  if (sizeKb > 50) {
    return 'simple';
  }

  return 'trivial';
}

export function extractSignals(repo: RepoRecord): ScoreBreakdown['signals'] {
  const topics = repo.topics ?? [];
  const languageCount = Object.keys(repo.languages ?? {}).length;
  const primaryLanguage = repo.language;

  // hasTests
  const testLanguages = ['jest', 'mocha', 'pytest', 'junit', 'rspec', 'vitest'];
  const hasTests =
    topics.includes('testing') ||
    topics.includes('tests') ||
    testLanguages.includes((primaryLanguage ?? '').toLowerCase()) ||
    (repo.name ?? '').toLowerCase().includes('test');

  // hasDocs
  const hasDocs =
    (repo.hasWiki === true) ||
    topics.includes('documentation') ||
    (repo.description !== null && (repo.description ?? '').length > 20);

  // hasCI
  const hasCI =
    topics.includes('ci') ||
    topics.includes('github-actions') ||
    topics.includes('devops') ||
    topics.includes('continuous-integration');

  // commitVelocity
  let commitVelocity: 'active' | 'moderate' | 'stale' | 'dead' = 'dead';
  if (repo.pushedAt) {
    const now = Date.now();
    const pushed = new Date(repo.pushedAt).getTime();
    const diffDays = (now - pushed) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) commitVelocity = 'active';
    else if (diffDays <= 30) commitVelocity = 'moderate';
    else if (diffDays <= 180) commitVelocity = 'stale';
    else commitVelocity = 'dead';
  }

  return {
    languageCount,
    primaryLanguage,
    hasTests,
    hasDocs,
    hasCI,
    topicSignals: topics,
    sizeKb: repo.sizeKb ?? 0,
    commitVelocity,
  };
}
