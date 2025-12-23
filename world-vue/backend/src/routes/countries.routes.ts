import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { countryService } from '../services/countryService';
import { isoCodeSchema } from '../schemas/country.schema';
import { logger } from '../utils/logger';

interface GetCountryParams {
  iso: string;
}

interface GetCountriesQuery {
  region?: string;
  subregion?: string;
  limit?: string;
  offset?: string;
}

/**
 * Register country routes
 */
export async function registerCountryRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/countries/:iso
   * Get a single country by ISO code (alpha-2 or alpha-3)
   */
  app.get<{ Params: GetCountryParams }>(
    '/api/v1/countries/:iso',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            iso: { type: 'string', minLength: 2, maxLength: 3 }
          },
          required: ['iso']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              capital: { type: ['string', 'null'] },
              population: { type: ['number', 'string', 'null'] }, // BigInt can be serialized as string
              region: { type: ['string', 'null'] },
              subregion: { type: ['string', 'null'] },
              area: { type: ['number', 'null'] },
              currency: { type: ['string', 'null'] },
              languages: { type: 'array', items: { type: 'string' } },
              flag: { type: ['string', 'null'] },
              lat: { type: ['number', 'null'] },
              lng: { type: ['number', 'null'] },
              timezone: { type: ['string', 'null'] },
              updatedAt: { type: 'string' },
              createdAt: { type: 'string' }
            }
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Params: GetCountryParams }>, reply: FastifyReply) => {
      try {
        const { iso } = request.params;

        // Validate ISO code format
        const validation = isoCodeSchema.safeParse(iso);
        if (!validation.success) {
          return reply.code(400).send({
            error: 'Invalid ISO Code',
            message: 'ISO code must be 2 or 3 characters (alpha-2 or alpha-3 format)',
            details: validation.error.errors
          });
        }

        // Get country from service
        const country = await countryService.getCountryByIso(iso);

        if (!country) {
          return reply.code(404).send({
            error: 'Country Not Found',
            message: `No country found with ISO code: ${iso}`
          });
        }

        return reply.code(200).send(country);
      } catch (error) {
        logger.error({ error, iso: request.params.iso }, 'Error in GET /api/v1/countries/:iso');
        
        return reply.code(503).send({
          error: 'Service Unavailable',
          message: 'Unable to fetch country data. Please try again later.'
        });
      }
    }
  );

  /**
   * GET /api/v1/countries
   * Get all countries with optional filters
   */
  app.get<{ Querystring: GetCountriesQuery }>(
    '/api/v1/countries',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            region: { type: 'string' },
            subregion: { type: 'string' },
            limit: { type: 'string', pattern: '^[0-9]+$' },
            offset: { type: 'string', pattern: '^[0-9]+$' }
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                capital: { type: ['string', 'null'] },
                population: { type: ['number', 'string', 'null'] }, // BigInt can be serialized as string
                region: { type: ['string', 'null'] },
                subregion: { type: ['string', 'null'] },
                area: { type: ['number', 'null'] },
                currency: { type: ['string', 'null'] },
                languages: { type: 'array', items: { type: 'string' } },
                flag: { type: ['string', 'null'] },
                lat: { type: ['number', 'null'] },
                lng: { type: ['number', 'null'] },
                timezone: { type: ['string', 'null'] },
                updatedAt: { type: 'string' },
                createdAt: { type: 'string' }
              }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Querystring: GetCountriesQuery }>, reply: FastifyReply) => {
      try {
        const { region, subregion, limit, offset } = request.query;

        const filters = {
          region,
          subregion,
          limit: limit ? parseInt(limit, 10) : undefined,
          offset: offset ? parseInt(offset, 10) : undefined
        };

        const countries = await countryService.getAllCountries(filters);

        return reply.code(200).send(countries);
      } catch (error) {
        logger.error({ error, query: request.query }, 'Error in GET /api/v1/countries');
        
        return reply.code(503).send({
          error: 'Service Unavailable',
          message: 'Unable to fetch countries. Please try again later.'
        });
      }
    }
  );
}
