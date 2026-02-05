import { ICommand } from "../../../shared/kernel/cqrs.ts";

export class UpdateTenantCommand implements ICommand {
    constructor(
        public readonly tenantId: string,
        public readonly name?: string
    ) {}
}
