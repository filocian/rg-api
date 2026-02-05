import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ISessionRepository } from "../../domain/session.repository.interface.ts";
import { LogoutCommand } from "./logout.command.ts";
import { LogoutHandler } from "./logout.handler.ts";

// Mocks
const mockSessionRepo = {
    saveRefreshToken: () => Promise.resolve(),
    saveAccessToken: () => Promise.resolve(),
    deleteAccessToken: () => Promise.resolve(),
    findRefreshToken: () => Promise.resolve(null),
    deleteRefreshToken: () => Promise.resolve(),
    deleteAllRefreshTokensForUser: () => Promise.resolve(),
} as unknown as ISessionRepository;

Deno.test("LogoutHandler Scenarios", async (t) => {
    
    await t.step("Should delete access token successfully", async () => {
        let deletedTokenId = "";
        mockSessionRepo.deleteAccessToken = async (id: string) => {
            deletedTokenId = id;
        };

        const handler = new LogoutHandler(mockSessionRepo);
        const command = new LogoutCommand("session-123");
        
        await handler.handle(command);
        
        assertEquals(deletedTokenId, "session-123");
    });
    
});
