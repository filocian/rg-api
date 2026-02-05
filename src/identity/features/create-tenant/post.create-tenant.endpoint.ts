import { Context } from 'hono';
import { z } from 'zod';
import { successResponse } from '../../../shared/infrastructure/api/envelope.ts';
import { validate } from '../../../shared/infrastructure/api/validate.ts';
import { dispatcher } from '../../../shared/infrastructure/bus/dispatcher.ts';
import { CreateTenantCommand } from './create-tenant.command.ts';

const CreateTenantSchema = z.object({
    slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1).optional()
});

export async function postTenant(c: Context) {
    const { slug, name } = validate(CreateTenantSchema, await c.req.json());
    
    const command = new CreateTenantCommand(slug, name);
    const response = await dispatcher.dispatchCommand(command);

    return c.json(successResponse(response, c.get('traceId')), 201);
}
