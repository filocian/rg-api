import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { IRoleRepository } from "../../domain/role.repository.interface.ts";
import { UpdateRoleCommand } from "./update-role.command.ts";

export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand, any> {
    
    constructor(private roleRepo: IRoleRepository) {}

    async handle(command: UpdateRoleCommand): Promise<any> {
        const { roleId, name } = command;

        try {
            const updatedRole = await this.roleRepo.update(roleId, { name });
            return updatedRole;
        } catch (error: any) {
            throw AppError.from("NOT_FOUND", "Role not found or permission denied", error);
        }
    }
}
