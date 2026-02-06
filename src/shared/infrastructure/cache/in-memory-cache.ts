import { ICacheStore } from "./cache-manager.ts";

/**
 * In-Memory Map Implementation
 * Fast, local cache for single-instance caching.
 */
export class InMemoryCache implements ICacheStore {
    private store = new Map<string, { val: any, exp: number }>();

    async get<T>(key: string): Promise<T | null> {
        const item = this.store.get(key);
        if (!item) return null;

        if (Date.now() > item.exp) {
            this.store.delete(key);
            return null;
        }

        return item.val as T;
    }

    async set(key: string, value: any, ttl: number = 60): Promise<void> {
        const exp = Date.now() + (ttl * 1000);
        this.store.set(key, { val: value, exp });
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }
}
