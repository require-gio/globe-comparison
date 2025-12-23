/**
 * API Response Types
 */

/**
 * Country entity from the API
 */
export interface Country {
  id: string; // ISO 3166-1 alpha-3 code
  name: string;
  capital: string | null;
  population: number;
  region: string;
  subregion: string;
  area: number;
  currency: string;
  languages: string[];
  flag: string;
  lat: number;
  lng: number;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * List of countries response
 */
export interface CountriesResponse {
  data: Country[];
  total: number;
  limit?: number;
  offset?: number;
}

/**
 * Single country response
 */
export interface CountryResponse {
  data: Country;
}

/**
 * API Error response
 */
export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
  stack?: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
  };
}

/**
 * Query parameters for fetching countries
 */
export interface GetCountriesParams {
  region?: string;
  subregion?: string;
  limit?: number;
  offset?: number;
}
