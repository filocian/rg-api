import { ITenantRepository, Tenant } from '../../domain/tenant.repository.interface.ts';
import { db } from '../database/db.ts';

export class SqlTenantRepository implements ITenantRepository {
    
    async findById(id: string): Promise<Tenant | null> {
        const result = await db.selectFrom('tenants')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
        
        return result || null;
    }

    async findBySlug(slug: string): Promise<Tenant | null> {
        const result = await db.selectFrom('tenants')
            .selectAll()
            .where('slug', '=', slug)
            .executeTakeFirst();
            
        return result || null;
    }

    async create(tenant: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>): Promise<Tenant> {
        const result = await db.insertInto('tenants')
            .values(tenant)
            .returningAll()
            .executeTakeFirstOrThrow();

        return result;
    }

    async update(id: string, data: Partial<Omit<Tenant, 'id' | 'created_at' | 'updated_at'>>): Promise<Tenant> {
        const result = await db.updateTable('tenants')
            .set({ ...data, updated_at: new Date() })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
            
        return result;
    }

    async delete(id: string): Promise<void> {
        await db.deleteFrom('tenants')
            .where('id', '=', id)
            .execute();
    }
}
