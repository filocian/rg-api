import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { ISessionRepository } from "../../domain/session.repository.interface.ts";
import { IUserRepository } from "../../domain/user.repository.interface.ts";
import { RevokeAccessCommand } from "./revoke-access.command.ts";

export class RevokeAccessHandler implements ICommandHandler<RevokeAccessCommand, void> {
    
    constructor(
        private userRepo: IUserRepository,
        private sessionRepo: ISessionRepository
    ) {}

    async handle(command: RevokeAccessCommand): Promise<void> {
        const { userId, refreshToken, context } = command;

        // 1. Global Revocation: Increment Token Version
        await this.userRepo.incrementTokenVersion(userId, context);

        // 2. Cleanup Refresh Token (if provided)
        if (refreshToken) {
                const { createHash } = await import("node:crypto");
                const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
                
                // We need to find ID first because delete expects ID usually, or we add deleteByHash to Interface.
                // My ISessionRepository has deleteRefreshToken(id).
                // I should probably add deleteRefreshTokenByHash or find first.
                // Let's check ISessionRepository again.
                // It has findRefreshTokenByHash(hash).
                
                const token = await this.sessionRepo.findRefreshTokenByHash(tokenHash);
                if (token) {
                    await this.sessionRepo.deleteRefreshToken(token.id);
                }
        } else {
            // Kill ALL refresh tokens for user
            await this.sessionRepo.deleteAllRefreshTokensForUser(userId);
        }
    }
}
