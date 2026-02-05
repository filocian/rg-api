import { Context } from 'hono';
import { successResponse } from "../../../shared/infrastructure/api/envelope.ts";
import { dispatcher } from "../../../shared/infrastructure/bus/dispatcher.ts";
import { DeleteTenantCommand } from "./delete-tenant.command.ts";

export async function deleteTenant(c: Context) {
    const tenantId = c.req.param('tenantId');
    const command = new DeleteTenantCommand(tenantId);
    
    await dispatcher.dispatchCommand(command);

    return c.json(successResponse({ message: "Tenant deleted" }, c.get('traceId')));
}
