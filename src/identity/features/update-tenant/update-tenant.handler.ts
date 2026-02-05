import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { ITenantRepository } from "../../domain/tenant.repository.interface.ts";
import { UpdateTenantCommand } from "./update-tenant.command.ts";

export class UpdateTenantHandler implements ICommandHandler<UpdateTenantCommand, any> {
    
    constructor(private tenantRepo: ITenantRepository) {}

    async handle(command: UpdateTenantCommand): Promise<any> {
        const { tenantId, name } = command;

        if (!name) return; // No op

        try {
            const updatedTenant = await this.tenantRepo.update(tenantId, { name });
            return updatedTenant;
        } catch (error: any) {
            // Kysely throws if no result found with ExecuteTakeFirstOrThrow logic in repo?
            // Yes, I used executeTakeFirstOrThrow in update implementation.
            // But wait, executeTakeFirstOrThrow throws "NoResultError".
            // I should catch it and throw NotFound.
            throw AppError.from("NOT_FOUND", "Tenant not found or permission denied", error);
        }
    }
}
