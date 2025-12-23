import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { countryRoutes } from './routes/countries.js';
import { globeRoutes } from './routes/globe.js';
import { healthRoutes } from './routes/health.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

export async function buildServer() {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Register CORS
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Register rate limiting
  await server.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
  });

  // Register custom middleware
  server.addHook('onRequest', requestLogger);
  server.setErrorHandler(errorHandler);

  // Register routes
  await server.register(healthRoutes, { prefix: '/health' });
  await server.register(countryRoutes, { prefix: '/api/countries' });
  await server.register(globeRoutes, { prefix: '/api/globe' });

  return server;
}

export async function start() {
  try {
    const server = await buildServer();
    
    await server.listen({ port: PORT, host: HOST });
    
    console.log(`Server listening on http://${HOST}:${PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}
