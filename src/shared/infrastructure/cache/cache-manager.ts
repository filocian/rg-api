
/**
 * Cache Manager Interface
 */
export interface ICacheManager {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
}

/**
 * In-Memory Map Implementation (for Dev/Test)
 */
export class InMemoryCache implements ICacheManager {
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

    async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
        const exp = Date.now() + (ttlSeconds * 1000);
        this.store.set(key, { val: value, exp });
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }
}

// TODO: Implement DenoKvCache later
