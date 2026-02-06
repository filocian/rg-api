import { Context } from 'hono';
import { z } from "zod";
import { successResponse } from "../../../shared/infrastructure/api/envelope.ts";
import { validate } from "../../../shared/infrastructure/api/validate.ts";
import { cqBus } from "../../../shared/infrastructure/bus/cqBus.ts";
import { UpdateTenantCommand } from "./update-tenant.command.ts";

const UpdateTenantSchema = z.object({
    name: z.string().min(1).optional()
});

export async function patchTenant(c: Context) {
    const tenantId = c.req.param('tenantId');
    const { name } = validate(UpdateTenantSchema, await c.req.json());

    const command = new UpdateTenantCommand(tenantId, name);
    const updated = await cqBus.dispatchCommand(command);

    return c.json(successResponse(updated, c.get('traceId')));
}
