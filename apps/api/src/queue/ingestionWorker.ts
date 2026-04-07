import { Worker, Job } from 'bullmq';
import { queueConnection, QUEUES } from './config.js';
import { ingestUserRepos } from '../services/ingestion.js';
import { query } from '../db/client.js';
import { analyzeRepo } from '@proofofship/analysis';
import type { RepoRecord } from '@proofofship/types';

export interface IngestionJobData {
  userId: string;
  accessToken: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const ingestionWorker = new Worker<IngestionJobData>(
  QUEUES.INGESTION,
  async (job: Job<IngestionJobData>) => {
    const { userId, accessToken } = job.data;
    const result = await ingestUserRepos(userId, accessToken);

    // 1. Query all repos for this user
    const { rows } = await query('SELECT * FROM repos WHERE user_id = $1', [userId]);

    // Format DB rows into RepoRecord objects
    const repos: RepoRecord[] = rows.map(r => ({
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
    }));

    // Process sequentially to respect rate limits
    for (const repo of repos) {
      try {
        // 2. Analyze repo
        const scoreResult = await analyzeRepo(repo);

        // 3. INSERT result into scores table
        const insertSql = `
          INSERT INTO scores (
            repo_id, user_id, score,
            comprehension_health, hallucination_debt,
            architectural_consistency, debt_trajectory,
            complexity_adjustment, complexity_tier,
            breakdown, version
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          )
          ON CONFLICT DO NOTHING
        `;
        
        await query(insertSql, [
          scoreResult.repoId,
          scoreResult.userId,
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

        // 4. Log success
        console.log(`Scored repo ${repo.fullName}: ${scoreResult.score}/100 (${scoreResult.breakdown.complexityTier})`);
        
        // Respect Gemini rate limits
        await delay(500);
      } catch (err: any) {
        console.error(`Failed to analyze repo ${repo.fullName}: ${err.message}`);
      }
    }

    return result;
  },
  {
    connection: queueConnection,
    concurrency: 2,
  }
);

ingestionWorker.on('completed', (job, result) => {
  console.log(`Job ${job.id}: ingested ${result?.ingested ?? 0} repos, updated ${result?.updated ?? 0} repos`);
});

ingestionWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});
