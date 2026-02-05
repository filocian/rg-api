import { ICommand } from "../../../shared/kernel/cqrs.ts";

export class AddPermissionCommand implements ICommand {
    constructor(
        public readonly roleId: string,
        public readonly permissionScope: string
    ) {}
}
