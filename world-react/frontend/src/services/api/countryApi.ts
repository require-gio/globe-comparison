import { useQuery } from '@tanstack/react-query';
import type { Country } from '../../types/Country';
import type { ApiErrorResponse } from '../../types/api';

// Use Vite env var when available; fall back to local backend on port 4002
const API_BASE_URL = (((import.meta.env.VITE_API_URL as string) || 'http://localhost:4002').replace(/\/$/, '')) + '/api';

async function fetchCountryByIso(isoCode: string): Promise<Country> {
  const response = await fetch(`${API_BASE_URL}/countries/${isoCode.toUpperCase()}`);
  
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(error.error?.message || `Failed to fetch country: ${isoCode}`);
  }
  
  return response.json();
}

export function useCountryData(isoCode: string | null) {
  return useQuery<Country, Error>({
    queryKey: ['country', isoCode],
    queryFn: () => {
      if (!isoCode) {
        throw new Error('No ISO code provided');
      }
      return fetchCountryByIso(isoCode);
    },
    enabled: !!isoCode && isoCode !== 'UNKNOWN',
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

export async function fetchAllCountries(): Promise<Country[]> {
  const response = await fetch(`${API_BASE_URL}/countries`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch countries');
  }
  
  return response.json();
}

export function useCountriesData() {
  return useQuery<Country[], Error>({
    queryKey: ['countries'],
    queryFn: fetchAllCountries,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });
}
