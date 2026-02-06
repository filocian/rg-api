import { Context } from 'hono';
import { successResponse } from "../../../shared/infrastructure/api/envelope.ts";
import { cqBus } from "../../../shared/infrastructure/bus/cqBus.ts";
import { RevokeAccessCommand } from "./revoke-access.command.ts";

import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";

export async function postRevokeAccess(c: Context) {
    const user = c.get('user'); // From AuthMiddleware
    const context = c.get('tenantContext');
    
    if (!context) {
        throw AppError.from("BAD_REQUEST", "X-Tenant-Id header required");
    }
    
    // Optional: get refresh token from body to delete specifically
    const body = await c.req.json().catch(() => ({})); 
    
    const command = new RevokeAccessCommand(user.id, context, body.refreshToken);
    await cqBus.dispatchCommand(command);

    return c.json(successResponse({ message: "Access revoked" }, c.get('traceId')));
}
