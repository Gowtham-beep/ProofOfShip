import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true
});

redis.on('error', () => {});

export async function getCached(key: string): Promise<string | null> {
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function setCache(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  try {
    await redis.set(key, value, 'EX', ttlSeconds);
  } catch {
  }
}
