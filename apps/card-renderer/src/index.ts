import './env.js';
import Fastify from 'fastify';
import { getCardData } from './scores.js';
import { generateCard } from './svg.js';
import { getCached, setCache } from './cache.js';

import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true
});

await fastify.register(cors, {
  origin: '*',
  methods: ['GET'],
});

fastify.get('/health', async () => {
  return { status: 'ok', service: 'card-renderer' };
});

fastify.get('/card/:username', async (request, reply) => {
  const { username } = request.params as { username: string };
  const cacheKey = `card:${username}`;

  const cached = await getCached(cacheKey);
  if (cached) {
    reply.header('Content-Type', 'image/svg+xml');
    reply.header('Cache-Control', 'public, max-age=300'); // Safe default for cache hits
    reply.header('X-Cache', 'HIT');
    return reply.send(cached);
  }

  const cardData = await getCardData(username);
  if (!cardData) {
    reply.status(404);
    return reply.type('text/plain').send('User not found');
  }

  const ttl = cardData.pending ? 300 : 3600;
  const svg = generateCard(cardData);
  await setCache(cacheKey, svg, ttl);

  reply.header('Content-Type', 'image/svg+xml');
  reply.header('Cache-Control', `public, max-age=${ttl}`);
  reply.header('X-Cache', 'MISS');
  return reply.send(svg);
});

const port = Number(process.env.CARD_PORT) || 3002;

const start = async () => {
  try {
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Card renderer running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
