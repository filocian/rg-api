import { assert, assertRejects } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { PasswordService } from "../../../shared/infrastructure/security/password.service.ts";
import { RegionId } from "../../../shared/kernel/multi-tenancy/region.ts";
import { ITenantRegionResolver } from "../../../shared/kernel/multi-tenancy/tenant-region-resolver.ts";
import { IPermissionRepository } from "../../domain/permission.repository.interface.ts";
import { ISessionRepository } from "../../domain/session.repository.interface.ts";
import { ITenantRepository } from "../../domain/tenant.repository.interface.ts";
import { IUserRepository } from "../../domain/user.repository.interface.ts";
import { LoginCommand } from "./login.command.ts";
import { LoginHandler } from "./login.handler.ts";

// Fix AppError type for assertRejects
// deno-lint-ignore no-explicit-any
const AppErrorClass = AppError as any;

const now = new Date();

// Mocks
const mockTenantRepo = {
    findBySlug: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    save: () => Promise.resolve(),
    delete: () => Promise.resolve(),
} as unknown as ITenantRepository;

const mockUserRepo = {
    findByEmail: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    save: () => Promise.resolve(),
    delete: () => Promise.resolve(),
} as unknown as IUserRepository;

const mockSessionRepo = {
    saveRefreshToken: () => Promise.resolve(),
    saveAccessToken: () => Promise.resolve(),
    deleteAccessToken: () => Promise.resolve(),
    findRefreshToken: () => Promise.resolve(null),
    deleteRefreshToken: () => Promise.resolve(),
    deleteAllRefreshTokensForUser: () => Promise.resolve(),
} as unknown as ISessionRepository;

const mockPermissionRepo = {} as unknown as IPermissionRepository;

const mockRegionResolver: ITenantRegionResolver = {
    resolveRegion: () => Promise.resolve(RegionId.EU),
};

// Test setup
Deno.test("LoginHandler Scenarios", async (t) => {
    
    // Override PasswordService.verify
    const originalVerify = PasswordService.verify;
    PasswordService.verify = async (pwd, hash) => pwd === "valid_password";

    const handler = new LoginHandler(
        mockTenantRepo,
        mockUserRepo,
        mockSessionRepo,
        mockPermissionRepo,
        mockRegionResolver
    );

    await t.step("Should return tokens on valid credentials", async () => {
        // Setup mocks
        mockTenantRepo.findBySlug = async () => ({ 
            id: "tenant-1", 
            slug: "acme", 
            name: "Acme",
            created_at: now,
            updated_at: now
        });
        mockRegionResolver.resolveRegion = async () => RegionId.EU;
        mockUserRepo.findByEmail = async () => ({ 
            id: "user-1", 
            email: "user@acme.com", 
            password_hash: "hash", 
            token_version: 1,
            tenant_id: "tenant-1",
            created_at: now,
            updated_at: now
        });

        const command = new LoginCommand("user@acme.com", "valid_password", "acme");
        const result = await handler.handle(command);

        assert(result.accessToken);
        assert(result.refreshToken);
    });

    await t.step("Should throw UNAUTHORIZED if tenant not found", async () => {
        mockTenantRepo.findBySlug = async () => null;

        const command = new LoginCommand("user@acme.com", "valid_password", "invalid-tenant");
        await assertRejects(
            () => handler.handle(command),
            AppErrorClass,
            "Invalid credentials"
        );
    });

    await t.step("Should throw INTERNAL_ERROR if region not found", async () => {
        mockTenantRepo.findBySlug = async () => ({ 
            id: "tenant-1", 
            slug: "acme", 
            name: "Acme",
            created_at: now,
            updated_at: now
        });
        mockRegionResolver.resolveRegion = async () => null;

        const command = new LoginCommand("user@acme.com", "valid_password", "acme");
        await assertRejects(
            () => handler.handle(command),
            AppErrorClass,
            "Region not found"
        );
    });

    await t.step("Should throw UNAUTHORIZED if user not found", async () => {
        mockTenantRepo.findBySlug = async () => ({ 
            id: "tenant-1", 
            slug: "acme", 
            name: "Acme",
            created_at: now,
            updated_at: now
        });
        mockRegionResolver.resolveRegion = async () => RegionId.EU;
        mockUserRepo.findByEmail = async () => null;

        const command = new LoginCommand("unknown@acme.com", "valid_password", "acme");
        await assertRejects(
            () => handler.handle(command),
            AppErrorClass,
            "Invalid credentials"
        );
    });

    await t.step("Should throw UNAUTHORIZED if password invalid", async () => {
        mockTenantRepo.findBySlug = async () => ({ 
            id: "tenant-1", 
            slug: "acme", 
            name: "Acme",
            created_at: now,
            updated_at: now
        });
        mockRegionResolver.resolveRegion = async () => RegionId.EU;
        mockUserRepo.findByEmail = async () => ({ 
            id: "user-1", 
            email: "user@acme.com", 
            password_hash: "hash", 
            tenant_id: "tenant-1",
            token_version: 1,
            created_at: now,
            updated_at: now
        });

        const command = new LoginCommand("user@acme.com", "wrong_password", "acme");
        await assertRejects(
            () => handler.handle(command),
            AppErrorClass,
            "Invalid credentials"
        );
    });

    // Cleanup
    PasswordService.verify = originalVerify;
});
