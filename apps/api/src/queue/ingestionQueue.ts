import { Queue } from 'bullmq';
import { queueConnection, QUEUES } from './config.js';

export const ingestionQueue = new Queue(QUEUES.INGESTION, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});
