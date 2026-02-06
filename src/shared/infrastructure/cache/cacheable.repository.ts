import { ICacheStore } from "./cache-manager.ts";

/**
 * Cacheable Repository
 * Abstract base class that adds dual-layer caching capabilities to repositories.
 */
export abstract class CacheableRepository {
    
    constructor(
        protected cacheStore: ICacheStore,
        protected localCacheStore: ICacheStore
    ) {}

    // -------------------------------------------------------------------------
    // Shared Cache Methods (Deno KV)
    // -------------------------------------------------------------------------

    /**
     * Retrieves an item from the shared cache, or fetches it and caches the result.
     * @param key Cache key
     * @param ttl TTL in seconds
     * @param fetcher Function to fetch data if cache miss
     * @param forceRefresh If true, ignores cache, fetches, and overwrites cache
     */
    protected async remember<T>(
        key: string, 
        ttl: number, 
        fetcher: () => Promise<T>, 
        forceRefresh = false
    ): Promise<T> {
        if (!forceRefresh) {
            const cached = await this.cacheStore.get<T>(key);
            if (cached !== null) {
                return cached;
            }
        }

        const value = await fetcher();
        await this.cacheStore.set(key, value, ttl);
        return value;
    }

    protected async get<T>(key: string): Promise<T | null> {
        return await this.cacheStore.get<T>(key);
    }

    protected async forget(key: string): Promise<void> {
        await this.cacheStore.delete(key);
    }

    // -------------------------------------------------------------------------
    // Local Cache Methods (In-Memory)
    // -------------------------------------------------------------------------

    /**
     * Retrieves an item from the local in-memory cache, or fetches it and caches the result.
     * @param key Cache key
     * @param ttl TTL in seconds
     * @param fetcher Function to fetch data if cache miss
     * @param forceRefresh If true, ignores cache, fetches, and overwrites cache
     */
    protected async rememberLocal<T>(
        key: string, 
        ttl: number, 
        fetcher: () => Promise<T>, 
        forceRefresh = false
    ): Promise<T> {
        if (!forceRefresh) {
            const cached = await this.localCacheStore.get<T>(key);
            if (cached !== null) {
                return cached;
            }
        }

        const value = await fetcher();
        await this.localCacheStore.set(key, value, ttl);
        return value;
    }

    protected async getLocal<T>(key: string): Promise<T | null> {
        return await this.localCacheStore.get<T>(key);
    }

    protected async forgetLocal(key: string): Promise<void> {
        await this.localCacheStore.delete(key);
    }
}
