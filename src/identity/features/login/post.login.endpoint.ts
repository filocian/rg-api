import { Context } from 'hono';
import { z } from 'zod';
import { successResponse } from '../../../shared/infrastructure/api/envelope.ts';
import { validate } from '../../../shared/infrastructure/api/validate.ts';
import { cqBus } from '../../../shared/infrastructure/bus/cqBus.ts';
import { LoginCommand } from './login.command.ts';

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    slug: z.string().min(1) // Tenant Slug is required to identify context
});

export async function postLogin(c: Context) {
    const { email, password, slug } = validate(LoginSchema, await c.req.json());
    
    const command = new LoginCommand(email, password, slug);
    const response = await cqBus.dispatchCommand(command);

    return c.json(successResponse(response, c.get('traceId')));
}
