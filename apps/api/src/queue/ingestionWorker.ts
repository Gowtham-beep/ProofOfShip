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
