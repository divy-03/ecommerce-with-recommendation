import { redisClient } from './redis';

// In-memory cache fallback
class InMemoryCache {
  private cache: Map<string, { value: string; expiry: number }> = new Map();

  get(key: string): string | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key: string, value: string, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries periodically
  startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Every minute
  }
}

const inMemoryCache = new InMemoryCache();
inMemoryCache.startCleanup();

/**
 * Unified cache manager that uses Redis when available, falls back to in-memory
 */
class CacheManager {
  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      if (redisClient.isAvailable()) {
        const value = await redisClient.get(key);
        if (value) {
          console.log(`Cache HIT (Redis): ${key}`);
          return JSON.parse(value) as T;
        }
      }

      // Fallback to in-memory
      const memValue = inMemoryCache.get(key);
      if (memValue) {
        console.log(`Cache HIT (Memory): ${key}`);
        return JSON.parse(memValue) as T;
      }

      console.log(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('Cache GET error:', error);
      return null;
    }
  }

  /**
   * Set cached value
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);

      // Try Redis first
      if (redisClient.isAvailable()) {
        await redisClient.set(key, stringValue, ttlSeconds);
        console.log(`Cache SET (Redis): ${key} [TTL: ${ttlSeconds}s]`);
      }

      // Always set in memory as fallback
      inMemoryCache.set(key, stringValue, ttlSeconds);
      console.log(`Cache SET (Memory): ${key} [TTL: ${ttlSeconds}s]`);
    } catch (error) {
      console.error('Cache SET error:', error);
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    if (redisClient.isAvailable()) {
      await redisClient.delete(key);
    }
    inMemoryCache.delete(key);
    console.log(`Cache DELETE: ${key}`);
  }

  /**
   * Delete all cached values for a user
   */
  async deleteUserCache(userId: string): Promise<void> {
    const pattern = `user:${userId}:*`;
    
    if (redisClient.isAvailable()) {
      await redisClient.deletePattern(pattern);
    }
    
    inMemoryCache.clear();
    console.log(`Cache CLEARED for user: ${userId}`);
  }

  /**
   * Get cache status
   */
  getStatus(): { redis: boolean; memory: boolean } {
    return {
      redis: redisClient.isAvailable(),
      memory: true,
    };
  }
}

export const cacheManager = new CacheManager();
