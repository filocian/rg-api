import { Context } from 'hono';
import { z } from 'zod';
import { successResponse } from '../../../shared/infrastructure/api/envelope.ts';
import { validate } from '../../../shared/infrastructure/api/validate.ts';
import { cqBus } from '../../../shared/infrastructure/bus/cqBus.ts';
import { CreateRoleCommand } from './create-role.command.ts';

const CreateRoleSchema = z.object({
    name: z.string().min(1).max(50),
    parentRoleId: z.string().uuid().optional()
});

export async function postRole(c: Context) {
    const { name, parentRoleId } = validate(CreateRoleSchema, await c.req.json());
    const user = c.get('user');
    
    const command = new CreateRoleCommand(user.tenantId, name, parentRoleId);
    const response = await cqBus.dispatchCommand(command);

    return c.json(successResponse(response, c.get('traceId')), 201);
}
