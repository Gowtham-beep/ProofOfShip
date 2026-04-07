import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL || '';
const tlsConfig = redisUrl.includes('upstash.io') || redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined;

export const queueConnection = new Redis(redisUrl, {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  tls: tlsConfig
});

export const QUEUES = {
  INGESTION: 'ingestion',
} as const;
