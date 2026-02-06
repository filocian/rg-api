import { Context } from 'hono';
import { z } from 'zod';
import { successResponse } from "../../../shared/infrastructure/api/envelope.ts";
import { validate } from "../../../shared/infrastructure/api/validate.ts";
import { cqBus } from "../../../shared/infrastructure/bus/cqBus.ts";
import { UpdateRoleCommand } from "./update-role.command.ts";

const UpdateRoleSchema = z.object({
    name: z.string().min(1).optional()
});

export async function updateRoleEndpoint(c: Context) {
    const roleId = c.req.param('roleId');
    const { name } = validate(UpdateRoleSchema, await c.req.json());

    const command = new UpdateRoleCommand(roleId, name);
    const updated = await cqBus.dispatchCommand(command);

    return c.json(successResponse(updated, c.get('traceId')));
}
