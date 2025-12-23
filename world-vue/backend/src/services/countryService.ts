import { countryModel } from '../models/Country';
import { CacheService } from './cache.service';
import { logger } from '../utils/logger';

export interface CountryData {
  id: string;
  name: string;
  capital: string | null;
  population: string | null; // BigInt serialized as string
  region: string | null;
  subregion: string | null;
  area: number | null;
  currency: string | null;
  languages: string[];
  flag: string | null;
  lat: number | null;
  lng: number | null;
  timezone: string | null;
  updatedAt: Date;
  createdAt: Date;
}

export interface CountrySearchFilters {
  region?: string;
  subregion?: string;
  limit?: number;
  offset?: number;
}

export class CountryService {
  private cacheService: CacheService;
  private readonly CACHE_TTL = 6 * 60 * 60; // 6 hours in seconds

  constructor() {
    this.cacheService = new CacheService();
  }

  /**
   * Get a country by ISO code with caching
   */
  async getCountryByIso(isoCode: string): Promise<CountryData | null> {
    const cacheKey = `country:${isoCode.toUpperCase()}`;

    try {
      // Try to get from cache first
      const cached = await this.cacheService.get<CountryData>(cacheKey);
      if (cached) {
        logger.info({ isoCode, source: 'cache' }, 'Country data retrieved from cache');
        return cached;
      }

      // If not in cache, get from database
      const country = await countryModel.findByIso(isoCode);
      
      if (!country) {
        logger.info({ isoCode }, 'Country not found');
        return null;
      }

      const countryData: CountryData = {
        id: country.id,
        name: country.name,
        capital: country.capital,
        population: country.population?.toString() || null, // Convert BigInt to string
        region: country.region,
        subregion: country.subregion,
        area: country.area,
        currency: country.currency,
        languages: country.languages,
        flag: country.flag,
        lat: country.lat,
        lng: country.lng,
        timezone: country.timezone,
        updatedAt: country.updatedAt,
        createdAt: country.createdAt
      };

      // Store in cache
      await this.cacheService.set(cacheKey, countryData, this.CACHE_TTL);
      logger.info({ isoCode, source: 'database' }, 'Country data retrieved from database and cached');

      return countryData;
    } catch (error) {
      logger.error({ error, isoCode }, 'Error fetching country data');
      throw error;
    }
  }

  /**
   * Get all countries with optional filters
   */
  async getAllCountries(filters?: CountrySearchFilters): Promise<CountryData[]> {
    try {
      const countries = await countryModel.findAll(filters);
      
      return countries.map(country => ({
        id: country.id,
        name: country.name,
        capital: country.capital,
        population: country.population?.toString() || null, // Convert BigInt to string
        region: country.region,
        subregion: country.subregion,
        area: country.area,
        currency: country.currency,
        languages: country.languages,
        flag: country.flag,
        lat: country.lat,
        lng: country.lng,
        timezone: country.timezone,
        updatedAt: country.updatedAt,
        createdAt: country.createdAt
      }));
    } catch (error) {
      logger.error({ error, filters }, 'Error fetching countries');
      throw error;
    }
  }

  /**
   * Search countries by name
   */
  async searchCountries(query: string, limit: number = 10): Promise<CountryData[]> {
    try {
      const countries = await countryModel.searchByName(query, limit);
      
      return countries.map(country => ({
        id: country.id,
        name: country.name,
        capital: country.capital,
        population: country.population?.toString() || null, // Convert BigInt to string
        region: country.region,
        subregion: country.subregion,
        area: country.area,
        currency: country.currency,
        languages: country.languages,
        flag: country.flag,
        lat: country.lat,
        lng: country.lng,
        timezone: country.timezone,
        updatedAt: country.updatedAt,
        createdAt: country.createdAt
      }));
    } catch (error) {
      logger.error({ error, query }, 'Error searching countries');
      throw error;
    }
  }

  /**
   * Check if a country exists
   */
  async countryExists(isoCode: string): Promise<boolean> {
    try {
      return await countryModel.exists(isoCode);
    } catch (error) {
      logger.error({ error, isoCode }, 'Error checking country existence');
      throw error;
    }
  }

  /**
   * Invalidate cache for a country
   */
  async invalidateCountryCache(isoCode: string): Promise<void> {
    const cacheKey = `country:${isoCode.toUpperCase()}`;
    await this.cacheService.delete(cacheKey);
    logger.info({ isoCode }, 'Country cache invalidated');
  }
}

// Export a singleton instance
export const countryService = new CountryService();
