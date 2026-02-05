import { createHash } from "node:crypto";
import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { PasswordService } from "../../../shared/infrastructure/security/password.service.ts";
import { ICommandHandler } from "../../../shared/kernel/cqrs.ts";
import { TenantContext } from "../../../shared/kernel/multi-tenancy/tenant-context.ts";
import { ITenantRegionResolver } from "../../../shared/kernel/multi-tenancy/tenant-region-resolver.ts";
import { IPermissionRepository } from "../../domain/permission.repository.interface.ts";
import { ISessionRepository } from "../../domain/session.repository.interface.ts";
import { ITenantRepository } from "../../domain/tenant.repository.interface.ts";
import { IUserRepository } from "../../domain/user.repository.interface.ts";
import { TokenService } from "../../infrastructure/token-service.ts";
import { LoginCommand } from "./login.command.ts";

export class LoginHandler implements ICommandHandler<LoginCommand, { accessToken: string; refreshToken: string }> {
    
    constructor(
        private tenantRepo: ITenantRepository,
        private userRepo: IUserRepository,
        private sessionRepo: ISessionRepository,
        private permissionRepo: IPermissionRepository,
        private regionResolver: ITenantRegionResolver
    ) {}

    async handle(command: LoginCommand): Promise<{ accessToken: string; refreshToken: string }> {
        const { email, password, slug } = command;

        // 1. Resolve Tenant
        const tenant = await this.tenantRepo.findBySlug(slug);
        if (!tenant) {
            throw AppError.from("UNAUTHORIZED", "Invalid credentials");
        }

        // 2. Resolve Region
        const region = await this.regionResolver.resolveRegion(tenant.id);
        if (!region) {
            throw AppError.from("INTERNAL_ERROR", `Region not found for tenant ${tenant.id}`);
        }
        const context = new TenantContext(tenant.id, region);

        // 3. Find User
        const user = await this.userRepo.findByEmail(email, context);
        
        if (!user || user.tenant_id !== tenant.id) {
            throw AppError.from("UNAUTHORIZED", "Invalid credentials");
        }

        // 4. Verify Password (Secure bcrypt comparison)
        const isValidPassword = await PasswordService.verify(password, user.password_hash);
        if (!isValidPassword) {
             throw AppError.from("UNAUTHORIZED", "Invalid credentials");
        }

        // 5. Issue Tokens
        
        // A. Create Refresh Token (Long Lived)
        const refreshToken = crypto.randomUUID();
        const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
        const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await this.sessionRepo.saveRefreshToken({
            user_id: user.id,
            token_hash: tokenHash,
            expires_at: refreshExpiresAt
        });

        // B. Create Access Token (Short Lived)
        const jti = crypto.randomUUID(); // Session ID
        const accessExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await this.sessionRepo.saveAccessToken({
            id: jti,
            user_id: user.id,
            expires_at: accessExpiresAt
        });

        // Generate JWT (Reference Token)
        const token = await TokenService.generate({
            sub: user.id,
            jti: jti,
            email: user.email,
            tenantId: tenant.id
        });

        return { accessToken: token, refreshToken };
    }
}
