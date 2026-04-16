import { Worker, Job } from 'bullmq';
import { queueConnection } from './config.js';
import { query } from '../db/client.js';
import { analyzeRepo } from '@proofofship/analysis';
import type { RepoRecord } from '@proofofship/types';

export interface AnalysisJobData {
  userId: string;
  repoIds: string[];
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const analysisWorker = new Worker<AnalysisJobData>(
  'analysis',
  async (job: Job<AnalysisJobData>) => {
    const { userId, repoIds } = job.data;
    let scored = 0;

    for (let i = 0; i < repoIds.length; i++) {
        const repoId = repoIds[i];
        
        const { rows } = await query('SELECT * FROM repos WHERE id = $1 AND user_id = $2', [repoId, userId]);
        if (rows.length === 0) {
            console.warn(`[${i + 1}/${repoIds.length}] Repo ${repoId} not found or doesn't belong to user ${userId}`);
            continue;
        }

        const r = rows[0];
        const repo: RepoRecord = {
          id: r.id,
          userId: r.user_id,
          githubRepoId: Number(r.github_repo_id),
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          language: r.language,
          languages: r.languages || {},
          isPrivate: r.is_private,
          isFork: r.is_fork,
          stargazersCount: r.stargazers_count,
          forksCount: r.forks_count,
          openIssuesCount: r.open_issues_count,
          sizeKb: r.size_kb,
          defaultBranch: r.default_branch,
          topics: r.topics || [],
          hasWiki: r.has_wiki,
          pushedAt: r.pushed_at,
          ingestedAt: r.ingested_at,
        };

        try {
            const scoreResult = await analyzeRepo(repo);

            const insertSql = `
              INSERT INTO scores (
                repo_id, user_id, commit_hash, score,
                comprehension_health, hallucination_debt,
                architectural_consistency, debt_trajectory,
                complexity_adjustment, complexity_tier,
                breakdown, version
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
              )
              ON CONFLICT DO NOTHING
            `;
            
            await query(insertSql, [
              scoreResult.repoId,
              scoreResult.userId,
              scoreResult.commitHash,
              scoreResult.score,
              scoreResult.breakdown.comprehensionHealth,
              scoreResult.breakdown.hallucinationDebt,
              scoreResult.breakdown.architecturalConsistency,
              scoreResult.breakdown.debtTrajectory,
              scoreResult.breakdown.complexityAdjustment,
              scoreResult.breakdown.complexityTier,
              scoreResult.breakdown,
              scoreResult.version
            ]);

            scored++;
            console.log(`[${i + 1}/${repoIds.length}] Scored repo ${repo.fullName}: ${scoreResult.score}/100 (${scoreResult.breakdown.complexityTier})`);
            
            await delay(500);
        } catch (err: any) {
            console.error(`Failed to analyze repo ${repo.fullName}: ${err.message}`);
        }
    }
    
    try {
      const userRes = await query('SELECT github_username FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length > 0) {
        const username = userRes.rows[0].github_username;
        await queueConnection.del(`card:${username}`);
      }
    } catch (err: any) {
      console.warn(`Failed to bust SVG cache for userId ${userId}:`, err.message);
    }
    
    return { scored };
  },
  {
    connection: queueConnection,
    concurrency: 2,
  }
);

analysisWorker.on('completed', (job, result) => {
  console.log(`Job ${job.id}: scored ${result?.scored ?? 0} repos`);
});

analysisWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});
