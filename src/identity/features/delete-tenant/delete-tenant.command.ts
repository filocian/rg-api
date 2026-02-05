import { ICommand } from "../../../shared/kernel/cqrs.ts";

export class DeleteTenantCommand implements ICommand {
    constructor(
        public readonly tenantId: string
    ) {}
}
