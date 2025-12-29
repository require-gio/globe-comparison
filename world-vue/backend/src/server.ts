import Fastify from 'fastify';
import cors from '@fastify/cors';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import { config } from './config/environment.js';
import { logger } from './utils/logger.js';
import { getPrismaClient, disconnectPrisma } from './config/database.js';
import { closeRedisClient } from './config/redis.js';

/**
 * Create and configure Fastify application
 */
export async function createApp() {
  const app = Fastify({
    logger,
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
  });

  // Register CORS plugin
  await app.register(cors, {
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Register compression plugin
  await app.register(compress, {
    global: true,
    threshold: 1024, // Compress responses > 1KB
  });

  // Register rate limiting plugin
  await app.register(rateLimit, {
    max: 100, // 100 requests
    timeWindow: '1 minute',
    cache: 10000, // Cache 10k IP addresses
    allowList: ['127.0.0.1'],
    redis: undefined, // Use in-memory for now, can switch to Redis for distributed systems
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    logger.error({
      err: error,
      requestId: request.id,
      url: request.url,
      method: request.method,
    });

    // Validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation,
      });
    }

    // Rate limit errors
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      });
    }

    // Generic server errors
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;

    return reply.status(statusCode).send({
      error: error.name || 'Error',
      message,
      ...(config.isDevelopment && { stack: error.stack }),
    });
  });

  // Not found handler
  app.setNotFoundHandler((request, reply) => {
    logger.warn({
      requestId: request.id,
      url: request.url,
      method: request.method,
      message: 'Route not found',
    });

    return reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  // Health check hook to verify database connection
  app.addHook('onReady', async () => {
    try {
      const prisma = getPrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      logger.info('Database connection verified');
    } catch (error) {
      logger.error({ err: error }, 'Database connection failed');
      throw error;
    }
  });

  // Graceful shutdown
  app.addHook('onClose', async () => {
    logger.info('Shutting down gracefully...');
    await disconnectPrisma();
    await closeRedisClient();
  });

  return app;
}

/**
 * Start the server
 */
async function start() {
  try {
    const app = await createApp();

    // Register routes
    const { registerHealthRoutes } = await import('./routes/health.routes.js');
    await registerHealthRoutes(app as any);
    
    const { registerCountryRoutes } = await import('./routes/countries.routes.js');
    await registerCountryRoutes(app as any);

    await app.listen({
      port: config.server.port,
      host: config.server.host,
    });

    logger.info(`Server listening on http://${config.server.host}:${config.server.port}`);
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
