/**
 * Types Package
 * 
 * This package contains shared TypeScript interfaces and types used across
 * the entire ProofOfShip monorepo.
 */

export interface User {
  id: string;
  githubUsername: string;
  score: number;
}

export interface ProjectAnalysis {
  id: string;
  repoUrl: string;
  score: number;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
}

export interface AuthUser {
  id: string;         // internal UUID
  githubId: number;
  username: string;
  avatarUrl: string;
  plan: 'free' | 'pro' | 'team';
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  private: boolean;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  default_branch: string;
  topics: string[];
  has_issues: boolean;
  has_wiki: boolean;
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RepoRecord {
  id: string;
  userId: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  languages: Record<string, number>;
  isPrivate: boolean;
  isFork: boolean;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  sizeKb: number;
  defaultBranch: string;
  topics: string[];
  hasWiki?: boolean;
  pushedAt: string | null;
  ingestedAt: string;
}

export type ComplexityTier =
  | 'trivial'
  | 'simple'
  | 'moderate'
  | 'complex'
  | 'advanced';

export interface ScoreBreakdown {
  comprehensionHealth: number;
  hallucinationDebt: number;
  architecturalConsistency: number;
  debtTrajectory: number;
  complexityAdjustment: number;
  complexityTier: ComplexityTier;
  signals: {
    languageCount: number;
    primaryLanguage: string | null;
    hasTests: boolean;
    hasDocs: boolean;
    hasCI: boolean;
    topicSignals: string[];
    sizeKb: number;
    commitVelocity: 'active' | 'moderate' | 'stale' | 'dead';
  };
  llmInsights: {
    comprehensionSummary: string;
    hallucinationRisk: 'low' | 'medium' | 'high';
    architectureNotes: string;
    improvementSuggestions: string[];
    techStackInsights?: string;
    maintenanceRisk?: string;
    scalabilityAssessment?: string;
  };
}

export interface ProofOfShipScore {
  repoId: string;
  userId: string;
  commitHash?: string;
  score: number;
  breakdown: ScoreBreakdown;
  percentile: number | null;
  version: number;
  createdAt: string;
}
