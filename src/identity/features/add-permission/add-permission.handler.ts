import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { IPermissionRepository } from "../../domain/permission.repository.interface.ts";
import { IRoleRepository } from "../../domain/role.repository.interface.ts";
import { AddPermissionCommand } from "./add-permission.command.ts";

export class AddPermissionHandler implements ICommandHandler<AddPermissionCommand, void> {
    
    constructor(
        private permissionsRepo: IPermissionRepository,
        private roleRepo: IRoleRepository
    ) {}

    async handle(command: AddPermissionCommand): Promise<void> {
        const { roleId, permissionScope } = command;

        // 1. Resolve Permission ID from scope
        const permission = await this.permissionsRepo.findByScope(permissionScope);
            
        if (!permission) {
             throw AppError.from("BAD_REQUEST", `Permission '${permissionScope}' does not exist`);
        }

        // 2. Verify Role
        const role = await this.roleRepo.findById(roleId);
            
        if (!role) {
             throw AppError.from("NOT_FOUND", "Role not found");
        }

        // 3. Add to Role
        await this.permissionsRepo.assignToRole(roleId, permission.id);
    }
}
