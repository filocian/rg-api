import { assert, assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { RegionId } from "../../../shared/kernel/multi-tenancy/region.ts";
import { TenantContext } from "../../../shared/kernel/multi-tenancy/tenant-context.ts";
import { ISessionRepository } from "../../domain/session.repository.interface.ts";
import { IUserRepository } from "../../domain/user.repository.interface.ts";
import { RevokeAccessCommand } from "./revoke-access.command.ts";
import { RevokeAccessHandler } from "./revoke-access.handler.ts";

// Mocks
const mockUserRepo = {
    incrementTokenVersion: () => Promise.resolve(),
} as unknown as IUserRepository;

const mockSessionRepo = {
    deleteAllRefreshTokensForUser: () => Promise.resolve(),
    findRefreshTokenByHash: () => Promise.resolve(null),
    deleteRefreshToken: () => Promise.resolve(),
} as unknown as ISessionRepository;

Deno.test("RevokeAccessHandler Scenarios", async (t) => {
    
    // We mock context
    const context = new TenantContext("tenant-1", RegionId.EU);

    await t.step("Should globally revoke access (kill all sessions)", async () => {
        let versionIncremented = false;
        let allDeleted = false;
        
        mockUserRepo.incrementTokenVersion = async (uid, ctx) => {
            if (uid === "user-1") versionIncremented = true;
        };
        mockSessionRepo.deleteAllRefreshTokensForUser = async (uid) => {
            if (uid === "user-1") allDeleted = true;
        };

        const handler = new RevokeAccessHandler(mockUserRepo, mockSessionRepo);
        const command = new RevokeAccessCommand("user-1", context);
        
        await handler.handle(command);

        assert(versionIncremented, "Token version should stand incremented");
        assert(allDeleted, "All refresh tokens should be deleted");
    });

    await t.step("Should revoke specific token if provided (and increment version)", async () => {
        let versionIncremented = false;
        let specificDeletedId = "";
        
        mockUserRepo.incrementTokenVersion = async (uid) => { versionIncremented = true; };
        
        // Mock find
        mockSessionRepo.findRefreshTokenByHash = async (hash) => ({ id: "token-123" } as any);
        // Mock delete
        mockSessionRepo.deleteRefreshToken = async (id) => { specificDeletedId = id; };

        const handler = new RevokeAccessHandler(mockUserRepo, mockSessionRepo);
        const command = new RevokeAccessCommand("user-1", context, "specific-refresh-token");
        
        await handler.handle(command);

        assert(versionIncremented, "Token version should still be incremented");
        assertEquals(specificDeletedId, "token-123");
    });

});
