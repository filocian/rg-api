import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { ITenantRepository } from "../../domain/tenant.repository.interface.ts";
import { DeleteTenantCommand } from "./delete-tenant.command.ts";

export class DeleteTenantHandler implements ICommandHandler<DeleteTenantCommand, void> {
    
    constructor(private tenantRepo: ITenantRepository) {}

    async handle(command: DeleteTenantCommand): Promise<void> {
        const { tenantId } = command;

        // Repository delete returns void. Kysely delete doesn't throw if no rows.
        // If we want to throw on not found, we check count.
        // My repo implementation just executes delete.
        await this.tenantRepo.delete(tenantId);
    }
}
