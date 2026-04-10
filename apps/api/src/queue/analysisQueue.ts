import { Queue } from 'bullmq';
import { queueConnection } from './config.js';

export const analysisQueue = new Queue('analysis', {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});
