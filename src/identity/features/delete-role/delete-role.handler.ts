import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { IRoleRepository } from "../../domain/role.repository.interface.ts";
import { DeleteRoleCommand } from "./delete-role.command.ts";

export class DeleteRoleHandler implements ICommandHandler<DeleteRoleCommand, void> {
    
    constructor(private roleRepo: IRoleRepository) {}

    async handle(command: DeleteRoleCommand): Promise<void> {
        const { roleId } = command;

        await this.roleRepo.delete(roleId);
    }
}
