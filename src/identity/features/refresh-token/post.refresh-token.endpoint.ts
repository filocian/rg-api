import { Context } from 'hono';
import { successResponse } from "../../../shared/infrastructure/api/envelope.ts";
import { cqBus } from "../../../shared/infrastructure/bus/cqBus.ts";
import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { RefreshTokenCommand } from "./refresh-token.command.ts";

export async function postRefreshToken(c: Context) {
    const body = await c.req.json();
    
    if (!body.refreshToken) {
         throw AppError.from("BAD_REQUEST", "Missing refreshToken");
    }

    const tenantContext = c.get('tenantContext');
    if (!tenantContext) {
        throw AppError.from("BAD_REQUEST", "X-Tenant-Id header required");
    }

    const command = new RefreshTokenCommand(body.refreshToken, tenantContext);
    const result = await cqBus.dispatchCommand(command);

    return c.json(successResponse(result, c.get('traceId')));
}
