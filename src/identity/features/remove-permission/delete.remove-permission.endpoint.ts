import { Context } from 'hono';
import { successResponse } from "../../../shared/infrastructure/api/envelope.ts";
import { dispatcher } from "../../../shared/infrastructure/bus/dispatcher.ts";
import { RemovePermissionCommand } from "./remove-permission.command.ts";

export async function removePermissionEndpoint(c: Context) {
    const roleId = c.req.param('roleId');
    const scope = c.req.param('scope'); // /roles/:id/permissions/:scope ?? No, scope can have special chars. 
    // Usually DELETE /roles/:id/permissions?scope=xxx OR body. Not strictly standard DELETE with body.
    // Let's use DELETE /roles/:id/permissions/:scope assuming scope is URL safe or encoded.
    // Or simpler: POST /roles/:id/permissions/remove
    
    // Using decoded param:
    const decodedScope = decodeURIComponent(scope);
    
    const command = new RemovePermissionCommand(roleId, decodedScope);
    await dispatcher.dispatchCommand(command);

    return c.json(successResponse({ message: "Permission removed" }, c.get('traceId')));
}
