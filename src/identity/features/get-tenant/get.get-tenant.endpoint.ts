import { Context } from 'hono';
import { successResponse } from '../../../shared/infrastructure/api/envelope.ts';
import { AppError } from '../../../shared/infrastructure/errors/app-error.ts';
import { SqlTenantRepository } from '../../infrastructure/repositories/sql-tenant.repository.ts';

export async function getTenant(c: Context) {
    const slug = c.req.param('slug');
    const repo = new SqlTenantRepository();
    
    const tenant = await repo.findBySlug(slug);

    if (!tenant) {
        throw AppError.from("NOT_FOUND", `Tenant '${slug}' not found`);
    }

    return c.json(successResponse(tenant, c.get('traceId')));
}
