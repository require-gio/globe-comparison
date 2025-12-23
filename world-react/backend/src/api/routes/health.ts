import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getPool } from '../../db/connection.js';
import { getRedisClient } from '../../db/redis.js';

export async function healthRoutes(server: FastifyInstance): Promise<void> {
  server.get(
    '/',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Check database connection
        const pool = getPool();
        await pool.query('SELECT 1');

        // Check Redis connection
        const redisClient = await getRedisClient();
        await redisClient.ping();

        return reply.send({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'connected',
            redis: 'connected',
          },
        });
      } catch (error) {
        return reply.status(503).send({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );
}
