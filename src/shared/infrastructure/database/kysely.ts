import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { AppError } from '../errors/app-error.ts';

const { Pool } = pg;

import { Generated } from 'kysely';

export interface JobsTable {
    id: Generated<string>;
    type: string;
    payload: any;
    status: 'pending' | 'processing' | 'failed' | string;
    attempts: Generated<number>;
    created_at: Generated<Date>;
    available_at: Generated<Date>;
    processed_at?: Date | null;
}

export interface Database {
    jobs: JobsTable;
}

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: Deno.env.get('DATABASE_URL') || 'postgres://postgres:postgres@localhost:5432/rg_api',
            max: 10,
        }),
    }),
});

/**
 * Helper to check DB connection
 */
export async function checkDbConnection(): Promise<void> {
    try {
const { sql } = await import('kysely');
        await sql`SELECT 1`.execute(db);
    } catch (error) {
        throw AppError.from("INTERNAL_ERROR", "Database connection failed", error as any);
    }
}
