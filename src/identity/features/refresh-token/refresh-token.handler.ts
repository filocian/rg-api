import { createHash } from "node:crypto";
import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { IPermissionRepository } from "../../domain/permission.repository.interface.ts";
import { ISessionRepository } from "../../domain/session.repository.interface.ts";
import { ITenantRepository } from "../../domain/tenant.repository.interface.ts";
import { IUserRepository } from "../../domain/user.repository.interface.ts";
import { TokenService } from "../../infrastructure/token-service.ts";
import { RefreshTokenCommand } from "./refresh-token.command.ts";

export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, any> {
    
    constructor(
        private sessionRepo: ISessionRepository,
        private userRepo: IUserRepository,
        private tenantRepo: ITenantRepository,
        private permissionRepo: IPermissionRepository
    ) {}

    async handle(command: RefreshTokenCommand): Promise<any> {
        const { refreshToken } = command;

        // 1. Hash the incoming token
        const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

        // 2. Find valid refresh token
        const storedToken = await this.sessionRepo.findRefreshTokenByHash(tokenHash);

        if (!storedToken || storedToken.expires_at < new Date()) {
            throw AppError.from("UNAUTHORIZED", "Invalid or expired refresh token");
        }

        // 3. Get User
        const user = await this.userRepo.findById(storedToken.user_id, command.context);
        if (!user) {
             throw AppError.from("UNAUTHORIZED", "User not found");
        }

        // 4. Get Tenant (for claims)
        const tenant = await this.tenantRepo.findById(user.tenant_id);
        if (!tenant) {
            throw AppError.from("UNAUTHORIZED", "Tenant context invalid");
        }
            
        // 5. Get Permissions (optional, if we put them in token, but we don't for now)
        // const scopes = await this.permissionRepo.getEffectivePermissions(user.id);

        // 6. Rotate Token (Transaction logic is implied in repository usage or manual orchestration)
        // Ideally we should run in transaction. ISessionRepository doesn't expose transactionCtx.
        // For now, we do it sequentially. If one fails, we might have inconsistency (old token deleted, new not created).
        // Pragmatic APOD approach: It's okay for now. Or we could add `rotateRefreshToken` to Repository.
        
        await this.sessionRepo.deleteRefreshToken(storedToken.id);

        const newRefreshToken = crypto.randomUUID();
        const newTokenHash = createHash('sha256').update(newRefreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await this.sessionRepo.saveRefreshToken({
            user_id: user.id,
            token_hash: newTokenHash,
            expires_at: expiresAt
        });

        // 7. Issue Access Token
        const jti = crypto.randomUUID();
        const accessExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await this.sessionRepo.saveAccessToken({
            id: jti,
            user_id: user.id,
            expires_at: accessExpiresAt
        });

        const accessToken = await TokenService.generate({
            sub: user.id,
            jti: jti,
            email: user.email,
            tenantId: user.tenant_id
        });

        return {
            accessToken,
            refreshToken: newRefreshToken
        };
    }
}
