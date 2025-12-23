import { useQuery } from '@tanstack/vue-query';
import { ref, type Ref } from 'vue';
// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface CountryData {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  capital: string | null;
  population: number | null;
  region: string | null;
  subregion: string | null;
  area: number | null;
  currency: string | null;
  languages: string | null;
  coordinates: string | null;
  timezone: string | null;
  updatedAt: string;
}

/**
 * Composable for querying country data with caching and request cancellation
 */
export function useCountryQuery(isoCode: Ref<string | null>) {
  const abortController = ref<AbortController | null>(null);

  const query = useQuery({
    queryKey: ['country', isoCode] as const,
    queryFn: async ({ signal }) => {
      if (!isoCode.value) {
        return null;
      }

      // Cancel previous request if exists
      if (abortController.value) {
        abortController.value.abort();
      }

      // Create new abort controller
      abortController.value = new AbortController();

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/countries/${isoCode.value}`,
          {
            signal: signal || abortController.value.signal,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CountryData = await response.json();
        return data;
      } catch (error: any) {
        // Don't throw error if request was aborted
        if (error.name === 'AbortError' || error.message === 'canceled') {
          return null;
        }
        throw error;
      }
    },
    enabled: () => !!isoCode.value,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  /**
   * Cancel the current request
   */
  const cancelRequest = () => {
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
    }
  };

  return {
    ...query,
    cancelRequest
  };
}
