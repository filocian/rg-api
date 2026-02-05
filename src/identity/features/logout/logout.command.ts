import { ICommand } from "../../../shared/kernel/cqrs.ts";

export class LogoutCommand implements ICommand {
    constructor(
        public readonly sessionId: string
    ) {}
}
