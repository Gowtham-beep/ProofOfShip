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
