/**
 * Seeder interface - All seeders must implement this
 */
export interface ISeeder {
    name: string;
    run(db: import('kysely').Kysely<any>): Promise<void>;
}
