import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { IRoleRepository } from "../../domain/role.repository.interface.ts";
import { CreateRoleCommand } from "./create-role.command.ts";

export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand, any> {
    
    constructor(private roleRepo: IRoleRepository) {}

    async handle(command: CreateRoleCommand): Promise<any> {
        const { tenantId, name, parentRoleId } = command;

        try {
            const newRole = await this.roleRepo.create({
                tenant_id: tenantId,
                name,
                parent_role_id: parentRoleId || null
            });
            return newRole;
        } catch (error: any) {
            if (error.code === '23505') {
                throw AppError.from("CONFLICT", `Role '${name}' already exists in this tenant`);
            }
            if (error.code === '42501') { 
                throw AppError.from("FORBIDDEN", "Insufficient permissions to create role");
            }
            throw error;
        }
    }
}
