import { Context } from 'hono';
import { successResponse } from "../../../shared/infrastructure/api/envelope.ts";
import { cqBus } from "../../../shared/infrastructure/bus/cqBus.ts";
import { DeleteRoleCommand } from "./delete-role.command.ts";

export async function deleteRoleEndpoint(c: Context) {
    const roleId = c.req.param('roleId');
    const command = new DeleteRoleCommand(roleId);
    
    await cqBus.dispatchCommand(command);

    return c.json(successResponse({ message: "Role deleted" }, c.get('traceId')));
}
