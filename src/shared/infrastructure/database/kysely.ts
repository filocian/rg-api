import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { AppError } from '../errors/app-error.ts';

const { Pool } = pg;

export interface Database {
    // This interface will be augmented by modules
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
