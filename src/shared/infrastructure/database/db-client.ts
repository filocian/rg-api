
/**
 * Abstract Database Client
 */
export interface IDbClient {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    runInTransaction<T>(callback: (client: IDbClient) => Promise<T>): Promise<T>;
}

/**
 * Concrete implementation will depend on the driver (e.g. Postgres.js or Deno Postgres)
 * For now, this is a placeholder/mockable structure.
 */
export class DbClient implements IDbClient {

    // In a real scenario, this would hold the pool connection
    private static instance: DbClient;

    private constructor() { }

    public static getInstance(): DbClient {
        if (!DbClient.instance) {
            DbClient.instance = new DbClient();
        }
        return DbClient.instance;
    }

    async query<T>(sql: string, params?: any[]): Promise<T[]> {
        // Implement actual DB call here
        // console.log(`[DB] Executing: ${sql}`, params);
        return [] as T[];
    }

    async runInTransaction<T>(callback: (client: IDbClient) => Promise<T>): Promise<T> {
        // Implement transaction logic (BEGIN, COMMIT, ROLLBACK)
        // For now, pass self (no-op transaction)
        return await callback(this);
    }
}
