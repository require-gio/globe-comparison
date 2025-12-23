import type { Country } from './Country';

export interface ApiError {
  message: string;
  statusCode: number;
  stack?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface CountryResponse extends Country {}

export interface CountriesResponse extends Array<Country> {}
