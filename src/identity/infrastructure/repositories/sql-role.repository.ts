import { IRoleRepository, Role } from '../../domain/role.repository.interface.ts';
import { db } from '../database/db.ts';

export class SqlRoleRepository implements IRoleRepository {
    
    async findById(id: string): Promise<Role | null> {
        const result = await db.selectFrom('roles')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
        
        return result || null;
    }

    async findByName(tenantId: string, name: string): Promise<Role | null> {
        const result = await db.selectFrom('roles')
            .selectAll()
            .where('tenant_id', '=', tenantId)
            .where('name', '=', name)
            .executeTakeFirst();
        
        return result || null;
    }

    async create(role: Omit<Role, 'id' | 'created_at'>): Promise<Role> {
        const result = await db.insertInto('roles')
            .values(role)
            .returningAll()
            .executeTakeFirstOrThrow();
        
        return result;
    }

    async update(id: string, data: Partial<Omit<Role, 'id' | 'created_at' | 'tenant_id'>>): Promise<Role> {
        const result = await db.updateTable('roles')
            .set(data)
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
        
        return result;
    }

    async delete(id: string): Promise<void> {
        await db.deleteFrom('roles')
            .where('id', '=', id)
            .execute();
    }

    async assignToUser(userId: string, roleId: string): Promise<void> {
        await db.insertInto('user_roles')
            .values({
                user_id: userId,
                role_id: roleId
            })
            .onConflict(oc => oc.doNothing())
            .execute();
    }

    async removeFromUser(userId: string, roleId: string): Promise<void> {
        await db.deleteFrom('user_roles')
            .where('user_id', '=', userId)
            .where('role_id', '=', roleId)
            .execute();
    }
}
