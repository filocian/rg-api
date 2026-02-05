import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { IPermissionRepository } from "../../domain/permission.repository.interface.ts";
import { IRoleRepository } from "../../domain/role.repository.interface.ts";
import { RemovePermissionCommand } from "./remove-permission.command.ts";

export class RemovePermissionHandler implements ICommandHandler<RemovePermissionCommand, void> {
    
    constructor(
        private permissionsRepo: IPermissionRepository,
        private roleRepo: IRoleRepository
    ) {}

    async handle(command: RemovePermissionCommand): Promise<void> {
        const { roleId, permissionScope } = command;

        const permission = await this.permissionsRepo.findByScope(permissionScope);

        if (!permission) return; 

        // Verify role ownership via RLS check (implied by findById within context usually, or just verify existence)
        const role = await this.roleRepo.findById(roleId);
            
        if (!role) throw AppError.from("NOT_FOUND", "Role not found");

        await this.permissionsRepo.removeFromRole(roleId, permission.id);
    }
}
