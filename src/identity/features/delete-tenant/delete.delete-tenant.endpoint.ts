import { Context } from 'hono';
import { successResponse } from "../../../shared/infrastructure/api/envelope.ts";
import { cqBus } from "../../../shared/infrastructure/bus/cqBus.ts";
import { DeleteTenantCommand } from "./delete-tenant.command.ts";

export async function deleteTenant(c: Context) {
    const tenantId = c.req.param('tenantId');
    const command = new DeleteTenantCommand(tenantId);
    
    await cqBus.dispatchCommand(command);

    return c.json(successResponse({ message: "Tenant deleted" }, c.get('traceId')));
}
