import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    // Create 'infrastructure' schema if it doesn't exist
    await db.schema.createSchema('infrastructure').ifNotExists().execute();

    // Create 'jobs' table
    await db.schema
        .withSchema('infrastructure')
        .createTable('jobs')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('type', 'varchar', (col) => col.notNull())
        .addColumn('payload', 'jsonb', (col) => col.notNull())
        .addColumn('attempts', 'integer', (col) => col.defaultTo(0).notNull())
        .addColumn('status', 'varchar', (col) => col.defaultTo('pending').notNull()) // pending, processing, failed
        .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('available_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('processed_at', 'timestamptz') // Optional: to keep history or soft delete
        .execute();

    // Index for finding available jobs
    await db.schema
        .withSchema('infrastructure')
        .createIndex('idx_jobs_availability')
        .on('jobs')
        .columns(['status', 'available_at'])
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.withSchema('infrastructure').dropTable('jobs').execute();
}
