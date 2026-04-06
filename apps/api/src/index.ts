import 'dotenv/config';
import Fastify from 'fastify';
import authRoutes from './routes/auth.js';
import { initDb } from './db/client.js';

const fastify = Fastify({
  logger: true
});


fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(authRoutes);

const port = Number(process.env.PORT) || 3001;

const start = async () => {
  try {
    await initDb();
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`API running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
