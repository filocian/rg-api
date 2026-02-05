import { ICommand } from "../../../shared/kernel/cqrs.ts";

export class RemovePermissionCommand implements ICommand {
    constructor(
        public readonly roleId: string,
        public readonly permissionScope: string
    ) {}
}
