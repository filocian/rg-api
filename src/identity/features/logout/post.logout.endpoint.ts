import { Context } from 'hono';
import { successResponse } from "../../../shared/infrastructure/api/envelope.ts";
import { cqBus } from "../../../shared/infrastructure/bus/cqBus.ts";
import { LogoutCommand } from "./logout.command.ts";

export async function postLogout(c: Context) {
    const user = c.get('user');
    
    // User must be authenticated to logout
    if (!user || !user.jti) {
         return c.json(successResponse({ message: "Logged out" }, c.get('traceId'))); 
    }

    const command = new LogoutCommand(user.jti);
    await cqBus.dispatchCommand(command);

    return c.json(successResponse({ message: "Logged out" }, c.get('traceId')));
}
