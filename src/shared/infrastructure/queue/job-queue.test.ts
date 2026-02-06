import { assertEquals } from "jsr:@std/assert";
import { IJob } from "../../kernel/job.ts";
import { db } from "../database/kysely.ts";
import { JobWorker } from "./job-worker.ts";
import { JobRepository } from "./job.repository.ts";

// Mock Logger
const mockLogger = {
    error: (_arg1: any, ..._args: any[]) => {}, // No-op for tests
    info: (_code: string, _msg: string, ..._args: any[]) => {},
    warn: (_code: string, _msg: string) => {},
    debug: (_code: string, _msg: string) => {},
    fatal: (_code: string, _msg: string) => {}
};

// Test Job Interface
interface TestJob extends IJob {
    type: "TEST_JOB";
    payload: { value: string };
}

Deno.test({
    name: "JobQueue - End to End Flow",
    sanitizeResources: false,
    sanitizeOps: false,
    fn: async () => {
        // 0. Setup (Clean table)
        const repository = new JobRepository();
        const worker = new JobWorker(mockLogger, repository, 100, 1);
        
        // Clean manually because migrations might not run in this test context easily without setup
        // Assuming integration environment has table, but for safety in atomic test:
        // We rely on 'beforeAll' or assume DB is ready. 
        // Let's just create a unique type to avoid collision with other tests.
        const TEST_TYPE = "TEST_E2E_" + Date.now();
        
        // 1. Register Handler
        const processed: string[] = [];
        worker.register(TEST_TYPE, {
            handle: (job: TestJob) => {
                processed.push(job.payload.value);
                return Promise.resolve();
            }
        });

        // 2. Start Worker
        worker.start();

        // 3. Enqueue Job
        await repository.enqueue({ type: TEST_TYPE, payload: { value: "hello" } });

        // 4. Wait for processing (Polling interval is 100ms)
        await new Promise(r => setTimeout(r, 1500)); 

        // 5. Verify
        assertEquals(processed.length, 1);
        assertEquals(processed[0], "hello");

        // 6. Verify processed (should be deleted from table)
        // We can't easily check DB without exposing repo internals, but we can check if it's polled again.
        const jobs = await repository.poll(1);
        const existing = jobs.find(j => j.type === TEST_TYPE);
        assertEquals(existing, undefined);

        worker.stop();
    }
});

Deno.test({
    name: "JobQueue - Transactional Outbox (Atomic)",
    sanitizeResources: false,
    sanitizeOps: false,
    fn: async () => {
    const repository = new JobRepository();
    const TEST_TYPE = "TEST_TX_" + Date.now();

    // Case 1: Commit
    await db.transaction().execute(async (trx) => {
        // Enqueue inside transaction
        await repository.enqueue({ type: TEST_TYPE, payload: { value: "committed" } }, 0, trx);
    });

    // Should exist
    const jobs1 = await repository.poll(10);
    const found1 = jobs1.find(j => j.type === TEST_TYPE && j.payload.value === "committed");
    if(found1) {
        await repository.complete(found1.id); // Cleanup
    }
    assertEquals(!!found1, true);


    // Case 2: Rollback
    try {
        await db.transaction().execute(async (trx) => {
            await repository.enqueue({ type: TEST_TYPE, payload: { value: "rolled_back" } }, 0, trx);
            throw new Error("Rollback!");
        });
    } catch (e) { /* Expected */ }

    // Should NOT exist
    const jobs2 = await repository.poll(10);
    const found2 = jobs2.find(j => j.type === TEST_TYPE && j.payload.value === "rolled_back");
    assertEquals(found2, undefined);

    await db.destroy();
    }
});
