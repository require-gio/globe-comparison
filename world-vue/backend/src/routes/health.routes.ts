import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getPrismaClient } from '../config/database.js';
import { getRedisClient } from '../config/redis.js';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
  };
}

/**
 * Health check route handler
 */
async function healthCheckHandler(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<HealthCheckResponse> {
  const checks = {
    database: 'disconnected' as 'connected' | 'disconnected',
    redis: 'disconnected' as 'connected' | 'disconnected',
  };

  // Check database connection
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch (error) {
    request.log.error({ err: error }, 'Database health check failed');
  }

  // Check Redis connection
  try {
    const redis = getRedisClient();
    await redis.ping();
    checks.redis = 'connected';
  } catch (error) {
    request.log.error({ err: error }, 'Redis health check failed');
  }

  const isHealthy = checks.database === 'connected' && checks.redis === 'connected';
  const statusCode = isHealthy ? 200 : 503;

  return reply.status(statusCode).send({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: checks,
  });
}

/**
 * Register health check routes
 */
export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', healthCheckHandler);
  app.get('/api/health', healthCheckHandler); // Also available under /api prefix
}
