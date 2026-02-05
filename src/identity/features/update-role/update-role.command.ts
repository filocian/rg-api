import { ICommand } from "../../../shared/kernel/cqrs.ts";

export class UpdateRoleCommand implements ICommand {
    constructor(
        public readonly roleId: string,
        public readonly name?: string
    ) {}
}
