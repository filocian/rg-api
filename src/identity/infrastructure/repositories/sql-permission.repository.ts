import { sql } from 'kysely';
import { IPermissionRepository, Permission } from '../../domain/permission.repository.interface.ts';
import { db } from '../database/db.ts';

export class SqlPermissionRepository implements IPermissionRepository {
    
    async findByScope(scope: string): Promise<Permission | null> {
        const result = await db.selectFrom('permissions')
            .selectAll()
            .where('scope', '=', scope)
            .executeTakeFirst();
        
        return result || null;
    }

    async create(permission: Omit<Permission, 'id'>): Promise<Permission> {
        const result = await db.insertInto('permissions')
            .values(permission)
            .returningAll()
            .executeTakeFirstOrThrow();
        
        return result;
    }

    async assignToRole(roleId: string, permissionId: string): Promise<void> {
        await db.insertInto('role_permissions')
            .values({
                role_id: roleId,
                permission_id: permissionId
            })
            .onConflict(oc => oc.doNothing())
            .execute();
    }

    async removeFromRole(roleId: string, permissionId: string): Promise<void> {
        await db.deleteFrom('role_permissions')
            .where('role_id', '=', roleId)
            .where('permission_id', '=', permissionId)
            .execute();
    }

    async getEffectivePermissions(userId: string): Promise<string[]> {
        const permissionsResult = await sql<{ scope: string }>`
            SELECT scope FROM get_effective_permissions(${userId})
        `.execute(db);
        
        return permissionsResult.rows.map((r: { scope: string }) => r.scope);
    }
}
