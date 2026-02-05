import { ICommand } from "../../../shared/kernel/cqrs.ts";
import { TenantContext } from "../../../shared/kernel/multi-tenancy/tenant-context.ts";

export class RefreshTokenCommand implements ICommand {
    constructor(
        public readonly refreshToken: string,
        public readonly context: TenantContext
    ) {}
}
