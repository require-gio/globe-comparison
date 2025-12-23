import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { countryService } from '../../services/CountryService.js';
import { cacheService } from '../../services/CacheService.js';

const CACHE_TTL = 300; // 5 minutes

export async function countryRoutes(server: FastifyInstance): Promise<void> {
  // GET /api/countries/:iso - Get country by ISO code
  server.get<{ Params: { iso: string } }>(
    '/:iso',
    async (request: FastifyRequest<{ Params: { iso: string } }>, reply: FastifyReply) => {

        console.log("Doing something")
        console.log(request.params)
      const { iso } = request.params;

      // Validate ISO code format
      if (!/^[A-Z]{3}$/i.test(iso)) {
        return reply.status(400).send({
          error: {
            message: 'Invalid ISO code format. Must be 3 letters.',
            statusCode: 400,
          },
        });
      }

      // Try cache first
      const cacheKey = `country:${iso.toUpperCase()}`;
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        return reply.send(cached);
      }

      // Get from database
      const country = await countryService.getCountryByIsoCode(iso);

      if (!country) {
        return reply.status(404).send({
          error: {
            message: `Country with ISO code '${iso.toUpperCase()}' not found`,
            statusCode: 404,
          },
        });
      }

      // Cache the result
      await cacheService.set(cacheKey, country, CACHE_TTL);

      return reply.send(country);
    }
  );

  // GET /api/countries - Get all countries
  server.get(
    '/',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const cacheKey = 'countries:all';
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        return reply.send(cached);
      }

      const countries = await countryService.getAllCountries();
      await cacheService.set(cacheKey, countries, CACHE_TTL);

      return reply.send(countries);
    }
  );
}
