
import { ICacheManager } from "./cache-manager.ts";

/**
 * Cache implementation using Deno KV.
 * Requires --unstable-kv flag.
 */
export class DenoKvCache implements ICacheManager {
    private keyValueStore: Deno.Kv | null = null;

    async init() {
        if (!this.keyValueStore) {
            // Open the default KV database
            // In Docker, this maps to the path specified in DENO_KV_PATH env var if set, 
            // or acts as per runtime default.
            const path = Deno.env.get("DENO_KV_PATH");
            this.keyValueStore = await Deno.openKv(path);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        await this.init();
        const result = await this.keyValueStore!.get<T>([key]);
        return result.value;
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        await this.init();

        const options: { expireIn?: number } = {};
        if (ttlSeconds) {
            options.expireIn = ttlSeconds * 1000; // API might expect milliseconds usually, but check Deno.Kv.set
            // WAIT: Deno.Kv.set takes { expireIn: ms } since recent versions?
            // Actually Deno KV currently supports expiration via distinct mechanisms in some libraries, 
            // but native Deno KV 'set' 3rd arg is options.
            // Let's verify Deno KV API for expiration.
            // As of Deno 1.40+, expireIn option is available.
            options.expireIn = ttlSeconds * 1000;
        }

        await this.keyValueStore!.set([key], value, options);
    }

    async delete(key: string): Promise<void> {
        await this.init();
        await this.keyValueStore!.delete([key]);
    }

    async close() {
        if (this.keyValueStore) {
            this.keyValueStore.close();
            this.keyValueStore = null;
        }
    }
}
