import { sql } from "kysely";
import { IJob, IJobRepository } from "../../kernel/job.ts";
import { db } from "../database/kysely.ts"; // Assuming default DB export

export class JobRepository implements IJobRepository {
    
    /**
     * Enqueues a job securely.
     * Uses the current transaction context if provided (for Atomicity/Outbox).
     */
    async enqueue(job: IJob, delayMinutes: number = 0, trx?: any): Promise<void> {
        const connection = trx || db; // Use transaction or default connection
        
        // Calculate availability time
        const availableAt = delayMinutes > 0 
            ? sql<Date>`now() + interval '${sql.raw(delayMinutes.toString())} minutes'`
            : sql<Date>`now()`;

        await connection
            .withSchema('infrastructure')
            .insertInto('jobs')
            .values({
                type: job.type,
                payload: JSON.stringify(job.payload),
                status: 'pending',
                available_at: availableAt,
                attempts: 0
            })
            .execute();
    }

    /**
     * Polls for the next available job, locking it (SKIP LOCKED).
     * Guaranteed to be concurrency-safe.
     */
    async poll(limit: number = 1): Promise<any[]> {
        return await db.transaction().execute(async (trx) => {
            const jobs = await trx
                .withSchema('infrastructure')
                .selectFrom('jobs')
                .selectAll()
                .where('status', '=', 'pending')
                .where('available_at', '<=', sql<Date>`now()`)
                .limit(limit)
                .forUpdate()
                .skipLocked() // THE MAGIC
                .execute();

            if (jobs.length === 0) return [];

            // Mark as processing immediately inside the transaction
            const ids = jobs.map(j => j.id);
            await trx
                .withSchema('infrastructure')
                .updateTable('jobs')
                .set({ status: 'processing' })
                .where('id', 'in', ids)
                .execute();

            return jobs.map(j => ({
                ...j,
                payload: typeof j.payload === 'string' ? JSON.parse(j.payload) : j.payload // Handle potential string/json difference in drivers
            }));
        });
    }

    /**
     * Completes a job (Deletes it to keep table small).
     */
    async complete(jobId: string): Promise<void> {
        await db
            .withSchema('infrastructure')
            .deleteFrom('jobs')
            .where('id', '=', jobId)
            .execute();
    }

    /**
     * Fails a job (Backoff strategy).
     */
    async fail(jobId: string, error: string): Promise<void> {
        // Simple exponential backoff: attempts^2 minutes
        // We need to fetch current attempts first to calculate backoff, 
        // OR we can do it in SQL if we are clever. Simpler to just update status and let 'attempts' increment.
        
        await db
            .withSchema('infrastructure')
            .updateTable('jobs')
            .set((eb) => ({
                status: 'pending', // Retry
                attempts: sql<number>`attempts + 1`,
                available_at: sql<Date>`now() + (power(2, attempts + 1) || ' minutes')::interval` 
            }))
            .where('id', '=', jobId)
            .execute();
    }
}

export const jobRepository = new JobRepository();
