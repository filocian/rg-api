import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { RegionId } from "../../kernel/multi-tenancy/region.ts";
import { AppError } from "../errors/app-error.ts";
import { Database } from "./kysely.ts";

const { Pool } = pg;

export interface IDataRouter {
    getConnection(region: RegionId): Promise<Kysely<Database>>;
    disconnect(): Promise<void>;
}

export class PostgresDataRouter implements IDataRouter {
    private connections: Map<string, Kysely<Database>> = new Map();

    constructor() {}

    async getConnection(region: RegionId): Promise<Kysely<Database>> {
        const regionKey = region.value;
        if (this.connections.has(regionKey)) {
            return this.connections.get(regionKey)!;
        }

        const connectionString = this.getConnectionStringForRegion(region);
        const db = this.createConnection(connectionString);
        
        // Optimize: Check connection before storing? Or rely on pool.
        
        this.connections.set(regionKey, db);
        return db;
    }

    private getConnectionStringForRegion(region: RegionId): string {
        const envKey = `DATABASE_URL_${region.value}`;
        const url = Deno.env.get(envKey);
        
        if (!url) {
            throw AppError.from("INTERNAL_ERROR", `No database configuration for region: ${region.value}. Expected env var: ${envKey}`);
        }
        return url;
    }

    async disconnect(): Promise<void> {
        for (const [key, db] of this.connections) {
            await db.destroy();
        }
        this.connections.clear();
    }

    private createConnection(connectionString: string): Kysely<Database> {
        return new Kysely<Database>({
            dialect: new PostgresDialect({
                pool: new Pool({
                    connectionString: connectionString,
                    max: 10, // Logic for pool size?
                }),
            }),
        });
    }
}
