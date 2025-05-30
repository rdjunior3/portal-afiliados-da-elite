import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiration: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

class LocalCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxSize = 100;

  set<T>(key: string, data: T, options?: CacheOptions): void {
    const ttl = options?.ttl || this.defaultTTL;
    const timestamp = Date.now();
    const expiration = timestamp + ttl;

    // Remove oldest entries if cache is full
    if (this.cache.size >= (options?.maxSize || this.maxSize)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp,
      expiration
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiration) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiration) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiration) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const globalCache = new LocalCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  globalCache.cleanup();
}, 5 * 60 * 1000);

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions & {
    enabled?: boolean;
    dependencies?: any[];
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const enabled = options?.enabled !== false;
  const dependencies = options?.dependencies || [];

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Check cache first (unless forcing refresh)
    if (!forceRefresh && globalCache.has(key)) {
      const cachedData = globalCache.get<T>(key);
      if (cachedData !== null) {
        setData(cachedData);
        setError(null);
        return cachedData;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      globalCache.set(key, result, options);
      setData(result);
      setLastFetch(Date.now());
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, enabled, options]);

  // Refresh function
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Invalidate cache entry
  const invalidate = useCallback(() => {
    globalCache.delete(key);
  }, [key]);

  // Initial load and dependency changes
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, key, ...dependencies]);

  // Check cache on mount
  useEffect(() => {
    if (enabled && globalCache.has(key)) {
      const cachedData = globalCache.get<T>(key);
      if (cachedData !== null) {
        setData(cachedData);
      }
    }
  }, [key, enabled]);

  return {
    data,
    isLoading,
    error,
    lastFetch,
    refresh,
    invalidate,
    isStale: lastFetch > 0 && Date.now() - lastFetch > (options?.ttl || 5 * 60 * 1000),
  };
}

// Utility functions for cache management
export const cacheUtils = {
  // Get cache instance for manual operations
  getCache: () => globalCache,
  
  // Prefetch data
  prefetch: async <T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions) => {
    try {
      const result = await fetcher();
      globalCache.set(key, result, options);
      return result;
    } catch (error) {
      console.error('Prefetch failed:', error);
      throw error;
    }
  },

  // Invalidate multiple keys
  invalidatePattern: (pattern: string) => {
    const cache = globalCache;
    const keysToDelete: string[] = [];
    
    for (const [key] of cache['cache'].entries()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => cache.delete(key));
  },

  // Get cache statistics
  getStats: () => ({
    size: globalCache.size(),
    entries: Array.from(globalCache['cache'].entries()).map(([key, entry]) => ({
      key,
      size: JSON.stringify(entry.data).length,
      age: Date.now() - entry.timestamp,
      ttl: entry.expiration - Date.now()
    }))
  })
}; 