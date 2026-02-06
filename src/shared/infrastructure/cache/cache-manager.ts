/**
 * Cache Store Interface
 * Low-level interface for cache storage providers.
 */
export interface ICacheStore {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
}
