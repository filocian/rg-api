import { Context } from 'hono';
import { successResponse } from '../../../shared/infrastructure/api/envelope.ts';
import { SqlPermissionRepository } from '../../infrastructure/repositories/sql-permission.repository.ts';

export async function getPermissions(c: Context) {
    const user = c.get('user');
    const repo = new SqlPermissionRepository();
    
    // Call repository method which internally calls the stored procedure
    const scopes = await repo.getEffectivePermissions(user.id);

    return c.json(successResponse({ scopes }, c.get('traceId')));
}
