import { Injectable } from '@angular/core';
import { Country } from '../models/country.model';

interface CacheEntry {
  data: Country;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CountryCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get country from cache if not expired
   * @param code - Country code
   * @returns Country data or null if not in cache or expired
   */
  get(code: string): Country | null {
    const entry = this.cache.get(code.toUpperCase());
    
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > this.CACHE_TTL) {
      // Remove expired entry
      this.cache.delete(code.toUpperCase());
      return null;
    }

    return entry.data;
  }

  /**
   * Store country data in cache
   * @param code - Country code
   * @param data - Country data to cache
   */
  set(code: string, data: Country): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now()
    };
    
    this.cache.set(code.toUpperCase(), entry);
  }

  /**
   * Clear a specific entry from cache
   * @param code - Country code to remove
   */
  remove(code: string): void {
    this.cache.delete(code.toUpperCase());
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [code, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > this.CACHE_TTL) {
        this.cache.delete(code);
      }
    }
  }
}
