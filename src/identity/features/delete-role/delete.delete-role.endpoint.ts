import { Context } from 'hono';
import { successResponse } from "../../../shared/infrastructure/api/envelope.ts";
import { dispatcher } from "../../../shared/infrastructure/bus/dispatcher.ts";
import { DeleteRoleCommand } from "./delete-role.command.ts";

export async function deleteRoleEndpoint(c: Context) {
    const roleId = c.req.param('roleId');
    const command = new DeleteRoleCommand(roleId);
    
    await dispatcher.dispatchCommand(command);

    return c.json(successResponse({ message: "Role deleted" }, c.get('traceId')));
}
