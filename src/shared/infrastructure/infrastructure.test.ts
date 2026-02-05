
import { assertEquals } from "jsr:@std/assert";
import { InMemoryCache } from "./cache/cache-manager.ts";
import { DenoKvCache } from "./cache/deno-kv-cache.ts";
import { AppError } from "./errors/app-error.ts";

/**
 * Test AppError
 */
Deno.test("AppError - Should retain properties", () => {
    const error = AppError.from("INTERNAL_ERROR", "Something went wrong", { httpStatus: 500, details: { foo: "bar" } });

    assertEquals(error.code, "INTERNAL_ERROR");
    assertEquals(error.message, "Something went wrong");
    assertEquals(error.httpStatus, 500);
    assertEquals(error.details!.foo, "bar");
});

/**
 * Test InMemoryCache
 */
Deno.test("InMemoryCache - Set and Get", async () => {
    const cache = new InMemoryCache();
    await cache.set("key1", "val1", 1);

    const value = await cache.get<string>("key1");
    assertEquals(value, "val1");
});

Deno.test("InMemoryCache - Expiration", async () => {
    const cache = new InMemoryCache();
    await cache.set("key2", "val2", 0.001); // 1ms

    // Wait for 10ms
    await new Promise(resolve => setTimeout(resolve, 10));

    const value = await cache.get("key2");
    assertEquals(value, null);
});

/**
 * Test DenoKvCache
 * This requires the environment to support Deno KV
 */
Deno.test("DenoKvCache - Set and Get", async () => {
    const cache = new DenoKvCache();

    // Use a unique key to avoid collisions in persistend KV
    const key = `test_key_${crypto.randomUUID()}`;

    await cache.set(key, "deno_val", 5);
    const value = await cache.get<string>(key);

    assertEquals(value, "deno_val");

    await cache.delete(key);
    const deleted = await cache.get(key);
    assertEquals(deleted, null);

    await cache.close();
});
