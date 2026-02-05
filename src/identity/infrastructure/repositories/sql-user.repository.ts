import { Kysely, sql } from 'kysely';
import { IDataRouter } from '../../../shared/infrastructure/database/data-router.ts';
import { TenantContext } from '../../../shared/kernel/multi-tenancy/tenant-context.ts';
import { IUserRepository, User } from '../../domain/user.repository.interface.ts';
import { IdentityDatabase } from '../database/db.ts';

export class SqlUserRepository implements IUserRepository {
    
    constructor(private dataRouter: IDataRouter) {}

    private async getDb(context: TenantContext): Promise<Kysely<IdentityDatabase>> {
        return await this.dataRouter.getConnection(context.regionId) as unknown as Kysely<IdentityDatabase>;
    }

    async findById(id: string, context: TenantContext): Promise<User | null> {
        const db = await this.getDb(context);
        const result = await db.selectFrom('users')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        return result || null;
    }

    async findByEmail(email: string, context: TenantContext): Promise<User | null> {
        const db = await this.getDb(context);
        const result = await db.selectFrom('users')
            .selectAll()
            .where('email', '=', email)
            .executeTakeFirst();
        
        return result || null;
    }

    async create(user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'token_version'>, context: TenantContext): Promise<User> {
        const db = await this.getDb(context);
        const result = await db.insertInto('users')
            .values(user)
            .returningAll()
            .executeTakeFirstOrThrow();

        return result;
    }

    async update(id: string, data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>, context: TenantContext): Promise<User> {
        const db = await this.getDb(context);
        const result = await db.updateTable('users')
            .set({ ...data, updated_at: new Date() })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();

        return result;
    }

    async incrementTokenVersion(id: string, context: TenantContext): Promise<void> {
        const db = await this.getDb(context);
        await db.updateTable('users')
            .set((_eb) => ({
                token_version: sql`token_version + 1`,
                updated_at: new Date()
            }))
            .where('id', '=', id)
            .execute();
    }
}
