import type {
  Country,
  CountriesResponse,
  CountryResponse,
  HealthCheckResponse,
  GetCountriesParams,
  ApiError,
} from '@/types/api';

/**
 * Base API configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Custom API error class
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: ApiError
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRequestError('Request timeout', 408);
    }
    throw error;
  }
}

/**
 * Parse API response with error handling
 */
async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: 'Unknown Error',
      message: response.statusText,
    }));

    throw new ApiRequestError(
      errorData.message || 'An error occurred',
      response.status,
      errorData
    );
  }

  return response.json();
}

/**
 * API client for backend communication
 */
export const api = {
  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health`);
    return parseResponse<HealthCheckResponse>(response);
  },

  /**
   * Get all countries with optional filters
   */
  async getCountries(params?: GetCountriesParams): Promise<CountriesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.region) queryParams.append('region', params.region);
    if (params?.subregion) queryParams.append('subregion', params.subregion);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${API_BASE_URL}/api/countries${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetchWithTimeout(url);
    return parseResponse<CountriesResponse>(response);
  },

  /**
   * Get a single country by ID (ISO code)
   */
  async getCountry(id: string): Promise<CountryResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/countries/${id}`);
    return parseResponse<CountryResponse>(response);
  },

  /**
   * Get countries by region
   */
  async getCountriesByRegion(region: string): Promise<CountriesResponse> {
    return this.getCountries({ region });
  },

  /**
   * Search countries by name (client-side for now, could be server endpoint later)
   */
  async searchCountries(query: string): Promise<Country[]> {
    const { data } = await this.getCountries();
    const lowerQuery = query.toLowerCase();
    return data.filter(
      (country) =>
        country.name.toLowerCase().includes(lowerQuery) ||
        country.id.toLowerCase().includes(lowerQuery)
    );
  },
};

/**
 * Type guard to check if error is ApiRequestError
 */
export function isApiError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}
