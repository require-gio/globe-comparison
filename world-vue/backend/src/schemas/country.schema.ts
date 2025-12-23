import { z } from 'zod';

/**
 * Zod schema for Country entity validation
 */
export const CountrySchema = z.object({
  id: z.string().length(3, 'Country code must be 3 characters (ISO 3166-1 alpha-3)'),
  name: z.string().min(1, 'Country name is required'),
  capital: z.string().nullable(),
  population: z.bigint().nonnegative(),
  region: z.string(),
  subregion: z.string(),
  area: z.number().nonnegative(),
  currency: z.string(),
  languages: z.array(z.string()),
  flag: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  timezone: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schema for creating a new country (without timestamps)
 */
export const CreateCountrySchema = CountrySchema.omit({
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema for updating a country (all fields optional except id)
 */
export const UpdateCountrySchema = CountrySchema.partial().required({ id: true });

/**
 * Schema for query parameters when fetching countries
 */
export const GetCountriesQuerySchema = z.object({
  region: z.string().optional(),
  subregion: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

/**
 * Schema for ISO code validation (alpha-2 or alpha-3)
 */
export const isoCodeSchema = z.string().min(2).max(3).regex(/^[A-Z]{2,3}$/i, 'ISO code must be 2 or 3 uppercase letters');

/**
 * Schema for country ID parameter
 */
export const CountryIdParamSchema = z.object({
  id: z.string().length(3, 'Country code must be 3 characters'),
});

// Export TypeScript types inferred from schemas
export type Country = z.infer<typeof CountrySchema>;
export type CreateCountry = z.infer<typeof CreateCountrySchema>;
export type UpdateCountry = z.infer<typeof UpdateCountrySchema>;
export type GetCountriesQuery = z.infer<typeof GetCountriesQuerySchema>;
export type CountryIdParam = z.infer<typeof CountryIdParamSchema>;
