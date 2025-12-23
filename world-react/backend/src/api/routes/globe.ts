import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function globeRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/globe/topojson - Get TopoJSON data for globe
  server.get(
    '/topojson',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Path to TopoJSON file (would be in frontend/public or served from backend)
        const topoJsonPath = path.join(__dirname, '../../../data/countries.topojson');
        
        // Check if file exists
        if (!fs.existsSync(topoJsonPath)) {
          return reply.status(404).send({
            error: {
              message: 'TopoJSON data file not found',
              statusCode: 404,
            },
          });
        }

        // Read and send the TopoJSON file
        const topoJsonData = fs.readFileSync(topoJsonPath, 'utf-8');
        const data = JSON.parse(topoJsonData);

        // Set cache headers
        reply.header('Cache-Control', 'public, max-age=86400'); // 24 hours
        reply.header('ETag', `"topojson-v1"`);

        return reply.send(data);
      } catch (error) {
        _request.log.error({ error }, 'Error serving TopoJSON');
        return reply.status(500).send({
          error: {
            message: 'Error loading geography data',
            statusCode: 500,
          },
        });
      }
    }
  );
}
