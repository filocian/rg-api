import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ICacheStore } from "./cache-manager.ts";
import { CacheableRepository } from "./cacheable.repository.ts";

/**
 * Mock Cache Store implementation for testing
 */
class MockCacheStore implements ICacheStore {
    store = new Map<string, { val: any, exp?: number }>();
    getCalls = 0;
    setCalls = 0;
    deleteCalls = 0;

    async get<T>(key: string): Promise<T | null> {
        this.getCalls++;
        const item = this.store.get(key);
        if (!item) return null;
        if (item.exp && Date.now() > item.exp) {
            this.store.delete(key);
            return null;
        }
        return item.val as T;
    }
    
    async set(key: string, value: any, ttl?: number): Promise<void> {
        this.setCalls++;
        const exp = ttl ? Date.now() + (ttl * 1000) : undefined;
        this.store.set(key, { val: value, exp });
    }
    
    async delete(key: string): Promise<void> {
        this.deleteCalls++;
        this.store.delete(key);
    }

    clear() {
        this.store.clear();
        this.getCalls = 0;
        this.setCalls = 0;
        this.deleteCalls = 0;
    }
}

/**
 * Concrete implementation of CacheableRepository for testing
 */
class TestRepository extends CacheableRepository {
    constructor(
        cacheStore: ICacheStore,
        localCacheStore: ICacheStore
    ) {
        super(cacheStore, localCacheStore);
    }
    
    // Expose protected methods for testing
    public async publicRemember<T>(key: string, ttl: number, fetcher: () => Promise<T>, forceRefresh = false): Promise<T> {
        return this.remember(key, ttl, fetcher, forceRefresh);
    }

    public async publicRememberLocal<T>(key: string, ttl: number, fetcher: () => Promise<T>, forceRefresh = false): Promise<T> {
        return this.rememberLocal(key, ttl, fetcher, forceRefresh);
    }

    public async publicForget(key: string): Promise<void> {
        return this.forget(key);
    }

    public async publicForgetLocal(key: string): Promise<void> {
        return this.forgetLocal(key);
    }
}

Deno.test("CacheableRepository - Shared Cache Lifecycle", async (t) => {
    const mockShared = new MockCacheStore();
    const mockLocal = new MockCacheStore();
    const repo = new TestRepository(mockShared, mockLocal);

    await t.step("remember fetches and caches on miss", async () => {
        const fetcher = () => Promise.resolve("fresh-data");
        const key = "test:1";

        const result = await repo.publicRemember(key, 60, fetcher);

        assertEquals(result, "fresh-data");
        assertEquals(mockShared.getCalls, 1);
        assertEquals(mockShared.setCalls, 1);
        assertEquals(mockLocal.setCalls, 0); // Should not touch local
    });

    await t.step("remember returns cached value on hit", async () => {
        const fetcher = () => Promise.resolve("SHOULD_NOT_BE_CALLED");
        const key = "test:1"; // Already set

        const result = await repo.publicRemember(key, 60, fetcher);

        assertEquals(result, "fresh-data");
        assertEquals(mockShared.getCalls, 2); // 1 from prev test, 1 now
        assertEquals(mockShared.setCalls, 1); // No new set
    });

    await t.step("remember forceRefresh completely ignores cache", async () => {
        const fetcher = () => Promise.resolve("forced-data");
        const key = "test:1";

        const result = await repo.publicRemember(key, 60, fetcher, true);

        assertEquals(result, "forced-data");
        // forceRefresh=true skips get calls in my implementation? 
        // Let's check impl: "if (!forceRefresh) ... else fetch & set"
        // So getCalls should NOT increment if forceRefresh is true.
        assertEquals(mockShared.getCalls, 2); 
        assertEquals(mockShared.setCalls, 2); // Updated
    });

    await t.step("forget deletes from shared cache", async () => {
        const key = "test:1";
        await repo.publicForget(key);
        assertEquals(mockShared.deleteCalls, 1);
        
        const cached = await mockShared.get(key);
        assertEquals(cached, null);
    });
});

Deno.test("CacheableRepository - Local Cache Lifecycle", async (t) => {
    const mockShared = new MockCacheStore();
    const mockLocal = new MockCacheStore();
    const repo = new TestRepository(mockShared, mockLocal);

    await t.step("rememberLocal operates on local cache only", async () => {
        const fetcher = () => Promise.resolve("local-data");
        const key = "local:1";

        const result = await repo.publicRememberLocal(key, 60, fetcher);

        assertEquals(result, "local-data");
        assertEquals(mockLocal.setCalls, 1);
        assertEquals(mockShared.setCalls, 0);
    });
});
