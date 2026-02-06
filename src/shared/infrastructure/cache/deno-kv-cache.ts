import { ICacheStore } from "./cache-manager.ts";

/**
 * Cache implementation using Deno KV.
 * Persistent, distributed cache (shared across instances if using Deno Deploy or shared KV path).
 */
export class DenoKvCache implements ICacheStore {
    private keyValueStore: Deno.Kv | null = null;
    private kvPath?: string;

    constructor() {
        this.kvPath = Deno.env.get("DENO_KV_PATH");
    }

    async init() {
        if (!this.keyValueStore) {
            this.keyValueStore = await Deno.openKv(this.kvPath);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        await this.init();
        const result = await this.keyValueStore!.get<T>([key]);
        return result.value;
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        await this.init();

        const options: { expireIn?: number } = {};
        if (ttl) {
            options.expireIn = ttl * 1000;
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
