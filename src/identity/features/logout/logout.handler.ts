import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { ISessionRepository } from "../../domain/session.repository.interface.ts";
import { LogoutCommand } from "./logout.command.ts";

export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
    
    constructor(private sessionRepo: ISessionRepository) {}

    async handle(command: LogoutCommand): Promise<void> {
        const { sessionId } = command;
        console.log(`[LogoutHandler] Revoking session: ${sessionId}`);
        
        await this.sessionRepo.deleteAccessToken(sessionId);
    }
}
