import { ICommand } from "../../../shared/kernel/cqrs.ts";

export class DeleteRoleCommand implements ICommand {
    constructor(
        public readonly roleId: string
    ) {}
}
