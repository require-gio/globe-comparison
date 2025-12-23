import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../config/database';

// Infer the Country type from Prisma
type PrismaCountryResult = Awaited<ReturnType<PrismaClient['country']['findUnique']>>;
export type Country = NonNullable<PrismaCountryResult>;

export class CountryModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  /**
   * Find a country by ISO code (uses the id field which is ISO 3166-1 alpha-3)
   */
  async findByIso(isoCode: string): Promise<Country | null> {
    const upperCode = isoCode.toUpperCase();
    
    // The id field is the ISO 3166-1 alpha-3 code
    const country = await this.prisma.country.findUnique({
      where: {
        id: upperCode
      }
    });

    return country;
  }

  /**
   * Find a country by ID
   */
  async findById(id: string): Promise<Country | null> {
    return await this.prisma.country.findUnique({
      where: { id }
    });
  }

  /**
   * Find all countries with optional filters
   */
  async findAll(filters?: {
    region?: string;
    subregion?: string;
    limit?: number;
    offset?: number;
  }): Promise<Country[]> {
    const where: any = {};

    if (filters?.region) {
      where.region = filters.region;
    }

    if (filters?.subregion) {
      where.subregion = filters.subregion;
    }

    return await this.prisma.country.findMany({
      where,
      take: filters?.limit,
      skip: filters?.offset,
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Search countries by name
   */
  async searchByName(query: string, limit: number = 10): Promise<Country[]> {
    return await this.prisma.country.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      take: limit,
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get total count of countries
   */
  async count(filters?: { region?: string; subregion?: string }): Promise<number> {
    const where: any = {};

    if (filters?.region) {
      where.region = filters.region;
    }

    if (filters?.subregion) {
      where.subregion = filters.subregion;
    }

    return await this.prisma.country.count({ where });
  }

  /**
   * Check if a country exists by ISO code
   */
  async exists(isoCode: string): Promise<boolean> {
    const country = await this.findByIso(isoCode);
    return country !== null;
  }
}

// Export a singleton instance
export const countryModel = new CountryModel();
