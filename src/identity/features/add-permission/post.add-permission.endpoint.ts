import { Context } from 'hono';
import { z } from 'zod';
import { successResponse } from "../../../shared/infrastructure/api/envelope.ts";
import { validate } from "../../../shared/infrastructure/api/validate.ts";
import { cqBus } from "../../../shared/infrastructure/bus/cqBus.ts";
import { AddPermissionCommand } from "./add-permission.command.ts";

const AddPermissionSchema = z.object({
    scope: z.string().min(1)
        .transform(val => val.toLowerCase()) // Normalize
        .refine(val => {
            const parts = val.split('.');
            if (parts.length < 3) return false;
            
            const action = parts[parts.length - 1];
            const allowedVerbs = ['read', 'write', 'delete', 'softdelete', 'execute', 'manage', '*'];
            
            // Allow wildcards like identity.tenants.* or identity.tenants.**
            if (action === '**') return true; 

            return allowedVerbs.includes(action);
        }, {
            message: "Invalid scope format. Must be 'namespace.resource.action'. Allowed actions: read, write, delete, softdelete, execute, manage"
        })
});

export async function addPermissionEndpoint(c: Context) {
    const roleId = c.req.param('roleId');
    const { scope } = validate(AddPermissionSchema, await c.req.json());

    const command = new AddPermissionCommand(roleId, scope);
    await cqBus.dispatchCommand(command);

    return c.json(successResponse({ message: "Permission added" }, c.get('traceId')));
}
