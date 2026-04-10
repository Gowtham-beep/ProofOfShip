import { query } from './db.js';

export interface CardData {
  username: string;
  avatarUrl: string;
  score: number;
  complexityTier: string;
  topRepo: { name: string; score: number };
  totalRepos: number;
  breakdown: {
    comprehensionHealth: number;
    hallucinationDebt: number;
    architecturalConsistency: number;
    debtTrajectory: number;
  };
  lastUpdated: string;
  pending?: boolean;
}

interface UserScoreRow {
  github_username: string;
  github_avatar_url: string;
  avg_score: number;
  total_repos: number;
  last_updated: string;
  avg_comprehension: number;
  avg_hallucination: number;
  avg_architectural: number;
  avg_debt_trajectory: number;
}

interface TopRepoRow {
  name: string;
  score: number;
  complexity_tier: string;
}

async function fetchAvatarAsBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mime = res.headers.get('content-type') || 'image/png'
    return `data:${mime};base64,${base64}`
  } catch {
    return ''
  }
}

export async function getCardData(username: string): Promise<CardData | null> {
  const userCheck = await query<{id: number; github_username: string; github_avatar_url: string}>(
    `SELECT id, github_username, github_avatar_url FROM users WHERE github_username = $1`,
    [username]
  );

  if (userCheck.length === 0) {
    return null; // User never logged in
  }

  const userBase = userCheck[0];

  const userScores = await query<UserScoreRow>(
    `SELECT
      u.github_username,
      u.github_avatar_url,
      AVG(s.score)::int as avg_score,
      COUNT(DISTINCT s.repo_id) as total_repos,
      MAX(s.created_at) as last_updated,
      AVG(s.comprehension_health)::int as avg_comprehension,
      AVG(s.hallucination_debt)::int as avg_hallucination,
      AVG(s.architectural_consistency)::int as avg_architectural,
      AVG(s.debt_trajectory)::int as avg_debt_trajectory
    FROM users u
    JOIN scores s ON s.user_id = u.id
    JOIN repos r ON r.id = s.repo_id
    WHERE u.github_username = $1
      AND s.version = (
        SELECT MAX(s2.version)
        FROM scores s2
        WHERE s2.repo_id = s.repo_id
      )
    GROUP BY u.github_username, u.github_avatar_url`,
    [username]
  );

  if (userScores.length === 0) {
    const avatarDataUri = await fetchAvatarAsBase64(userBase.github_avatar_url || '');
    return {
      username: userBase.github_username,
      avatarUrl: avatarDataUri,
      score: 0,
      complexityTier: 'pending',
      topRepo: { name: 'Not analyzed yet', score: 0 },
      totalRepos: 0,
      breakdown: {
        comprehensionHealth: 0,
        hallucinationDebt: 0,
        architecturalConsistency: 0,
        debtTrajectory: 0,
      },
      lastUpdated: new Date().toISOString(),
      pending: true,
    };
  }

  const user = userScores[0];

  const topRepos = await query<TopRepoRow>(
    `SELECT r.name, s.score, s.complexity_tier
    FROM scores s
    JOIN repos r ON r.id = s.repo_id
    JOIN users u ON u.id = s.user_id
    WHERE u.github_username = $1
    ORDER BY s.score DESC
    LIMIT 1`,
    [username]
  );

  const topRepo = topRepos.length > 0
    ? { name: topRepos[0].name, score: topRepos[0].score }
    : { name: 'N/A', score: 0 };
    
  const complexityTier = topRepos.length > 0
    ? topRepos[0].complexity_tier
    : 'trivial';

  const avatarDataUri = await fetchAvatarAsBase64(user.github_avatar_url || '');

  return {
    username: user.github_username,
    avatarUrl: avatarDataUri,
    score: user.avg_score,
    complexityTier,
    topRepo,
    totalRepos: user.total_repos,
    breakdown: {
      comprehensionHealth: user.avg_comprehension,
      hallucinationDebt: user.avg_hallucination,
      architecturalConsistency: user.avg_architectural,
      debtTrajectory: user.avg_debt_trajectory,
    },
    lastUpdated: user.last_updated,
  };
}
