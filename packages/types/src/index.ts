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
