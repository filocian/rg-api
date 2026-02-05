import { assert, assertRejects } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { RegionId } from "../../../shared/kernel/multi-tenancy/region.ts";
import { TenantContext } from "../../../shared/kernel/multi-tenancy/tenant-context.ts";
import { IPermissionRepository } from "../../domain/permission.repository.interface.ts";
import { ISessionRepository } from "../../domain/session.repository.interface.ts";
import { ITenantRepository } from "../../domain/tenant.repository.interface.ts";
import { IUserRepository } from "../../domain/user.repository.interface.ts";
import { RefreshTokenCommand } from "./refresh-token.command.ts";
import { RefreshTokenHandler } from "./refresh-token.handler.ts";

// Fix AppError type for assertRejects
// deno-lint-ignore no-explicit-any
const AppErrorClass = AppError as any;

const now = new Date();
const future = new Date(now.getTime() + 1000000);

// Mocks
const mockTenantRepo = {
    findBySlug: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
} as unknown as ITenantRepository;

const mockUserRepo = {
    findById: () => Promise.resolve(null),
} as unknown as IUserRepository;

const mockSessionRepo = {
    findRefreshTokenByHash: () => Promise.resolve(null),
    deleteRefreshToken: () => Promise.resolve(),
    saveRefreshToken: () => Promise.resolve(),
    saveAccessToken: () => Promise.resolve(),
} as unknown as ISessionRepository;

const mockPermissionRepo = {} as unknown as IPermissionRepository;

// Helper to create hash (simple mock since we can't easily replicate sha256 in test setup without libs)
// Actually we can use crypto.subtle but handler uses node:crypto createHash.
// We'll mock the handler's hash logic dependency or just ensure mockSessionRepo expects the hash derived by handler.
// The handler uses node:crypto createHash. Deno fully supports it.

Deno.test("RefreshTokenHandler Scenarios", async (t) => {
    
    // We mock contexts
    const context = new TenantContext("tenant-1", RegionId.EU);

    const handler = new RefreshTokenHandler(
        mockSessionRepo,
        mockUserRepo,
        mockTenantRepo,
        mockPermissionRepo
    );

    await t.step("Should rotate tokens on valid refresh token", async () => {
        const refreshToken = "valid-refresh-token";
        // Hex hash of 'valid-refresh-token'
        // For testing, we can just intercept the call in mockSessionRepo
        
        mockSessionRepo.findRefreshTokenByHash = async (hash) => {
            // Assume hash matches
            return {
                id: "token-1",
                user_id: "user-1",
                token_hash: hash,
                expires_at: future,
                created_at: now
            };
        };

        mockUserRepo.findById = async () => ({
            id: "user-1",
            email: "user@acme.com",
            password_hash: "hash",
            tenant_id: "tenant-1",
            token_version: 1,
            created_at: now,
            updated_at: now
        });

        mockTenantRepo.findById = async () => ({
            id: "tenant-1",
            slug: "acme",
            name: "Acme",
            created_at: now,
            updated_at: now
        });

        const command = new RefreshTokenCommand(refreshToken, context);
        const result = await handler.handle(command);

        assert(result.accessToken);
        assert(result.refreshToken);
        assert(result.refreshToken !== refreshToken);
    });

    await t.step("Should throw UNAUTHORIZED if token not found/expired", async () => {
        mockSessionRepo.findRefreshTokenByHash = async () => null;

        const command = new RefreshTokenCommand("invalid-token", context);
        await assertRejects(
            () => handler.handle(command),
            AppErrorClass,
            "Invalid or expired refresh token"
        );
    });

    await t.step("Should throw UNAUTHORIZED if user not found", async () => {
        mockSessionRepo.findRefreshTokenByHash = async (hash) => ({
            id: "token-1",
            user_id: "user-1",
            token_hash: hash,
            expires_at: future,
            created_at: now
        });

        mockUserRepo.findById = async () => null;

        const command = new RefreshTokenCommand("valid-token", context);
        await assertRejects(
            () => handler.handle(command),
            AppErrorClass,
            "User not found"
        );
    });

});
