import { getRedisClient } from '../config/redis.js';
import { config } from '../config/environment.js';

/**
 * Cache service for managing Redis-based caching
 * Provides get/set/delete operations with configurable TTL
 */
export class CacheService {
  private redis = getRedisClient();
  private defaultTTL = config.cache.ttl; // 6 hours in seconds

  /**
   * Get a cached value by key
   * @param key - Cache key
   * @returns Parsed JSON value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a cached value with optional TTL
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttl - Time to live in seconds (defaults to 6 hours)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      const expiryTime = ttl || this.defaultTTL;
      await this.redis.setex(key, expiryTime, stringValue);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete a cached value
   * @param key - Cache key to delete
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param pattern - Redis key pattern (e.g., 'country:*')
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Check if a key exists in cache
   * @param key - Cache key to check
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   * @param key - Cache key
   * @returns Remaining TTL in seconds, or -1 if key doesn't exist
   */
  async getTTL(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error(`Cache getTTL error for key ${key}:`, error);
      return -1;
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
