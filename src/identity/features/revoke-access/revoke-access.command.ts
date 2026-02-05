import { ICommand } from "../../../shared/kernel/cqrs.ts";
import { TenantContext } from "../../../shared/kernel/multi-tenancy/tenant-context.ts";

export class RevokeAccessCommand implements ICommand {
    constructor(
        public readonly userId: string,
        public readonly context: TenantContext,
        // Optional: Revoke specific refresh token? 
        // For "Revoke Access" (Logout), usually we kill the specific session OR all.
        // Given 'token_version' strategy, we are killing ALL sessions.
        public readonly refreshToken?: string 
    ) {}
}
