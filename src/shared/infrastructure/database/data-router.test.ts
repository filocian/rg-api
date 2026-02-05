import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { sql } from 'kysely';
import { RegionId } from "../../kernel/multi-tenancy/region.ts";
import { PostgresDataRouter } from "./data-router.ts";

Deno.test("DataRouter Integration Test", async (t) => {
    const router = new PostgresDataRouter();

    // Ensure environment variables are loaded (Deno.env)
    // We assume docker/rg-api/.env or similar is loaded into the process running this test.
    // If running via `deno test`, we might need to load .env manually if not handled by task runner.
    // Ideally we assume the environment is set.

    await t.step("Should connect to EU database", async () => {
        const db = await router.getConnection(RegionId.EU);
        const result = await sql`SELECT current_database() as db_name`.execute(db);
        // @ts-ignore
        assertEquals(result.rows[0].db_name, "rg_eu");
    });

    await t.step("Should connect to US database", async () => {
        const db = await router.getConnection(RegionId.US);
        const result = await sql`SELECT current_database() as db_name`.execute(db);
        // @ts-ignore
        assertEquals(result.rows[0].db_name, "rg_us");
    });
    
    // Cleanup if necessary (DataRouter caches connections)
    await router.disconnect();
});
