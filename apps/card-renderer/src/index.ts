import Fastify from 'fastify';
import * as dotenv from 'dotenv';
import healthRoutes from './routes/health.js';

dotenv.config();

const fastify = Fastify({
  logger: true
});

// Register routes
fastify.register(healthRoutes);

const port = Number(process.env.PORT) || 3002;

const start = async () => {
  try {
    await fastify.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
