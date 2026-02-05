import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { ITenantRepository } from "../../domain/tenant.repository.interface.ts";
import { CreateTenantCommand } from "./create-tenant.command.ts";

export class CreateTenantHandler implements ICommandHandler<CreateTenantCommand, any> {
    
    constructor(private tenantRepo: ITenantRepository) {}

    async handle(command: CreateTenantCommand): Promise<any> {
        const { slug, name } = command;

        try {
            const newTenant = await this.tenantRepo.create({
                slug,
                name: name || slug
            });
            return newTenant;
        } catch (error: any) {
            // We need to catch unique violation from the repo or let it bubble?
            // SqlTenantRepository uses executeTakeFirstOrThrow, so it throws.
            // But we need to know the error code. Kysely driver specific.
            // In SqlTenantRepository, we didn't catch error.
            // So we need to handle it here or in Repo.
            // Ideally Repo throws DomainError or we handle driver error here.
            // To be consistent with previous code:
            if (error.code === '23505') { 
                throw AppError.from("CONFLICT", "Tenant slug already exists");
            }
            throw error;
        }
    }
}
