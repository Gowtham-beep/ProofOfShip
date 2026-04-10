import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
import Fastify from 'fastify';
import cors from '@fastify/cors';
import authRoutes from './routes/auth.js';
import reposRoutes from './routes/repos.js';
import scoresRoutes from './routes/scores.js';
import { initDb, pool } from './db/client.js';
import { ingestionWorker } from './queue/ingestionWorker.js';
import { ingestionQueue } from './queue/ingestionQueue.js';
import { analysisWorker } from './queue/analysisWorker.js';
import { analysisQueue } from './queue/analysisQueue.js';

const fastify = Fastify({
  logger: true
});

fastify.register(cors, {
  origin: true, // Allow all origins for local dev, or specific origins like ['http://localhost:3000']
  credentials: true
});

fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(authRoutes);
fastify.register(reposRoutes);
fastify.register(scoresRoutes);

const port = Number(process.env.PORT) || 3001;

const start = async () => {
  try {
    await initDb();
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`API running on http://localhost:${port}`);
    console.log("Ingestion worker started");
    console.log("Analysis worker started");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await ingestionWorker.close();
  await ingestionQueue.close();
  await analysisWorker.close();
  await analysisQueue.close();
  await pool.end();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
