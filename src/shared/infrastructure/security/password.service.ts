import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

// Cost factor: higher = more secure but slower. 10 = ~100ms, 12 = ~300ms
const ENV_COST = parseInt(Deno.env.get('BCRYPT_COST') || '10', 10);
const BCRYPT_COST = ENV_COST < 4 ? 4 : ENV_COST; // Enforce minimum cost of 4

/**
 * Service for secure password hashing and verification.
 * Uses bcrypt with cost factor from BCRYPT_COST env variable.
 */
export class PasswordService {
    /**
     * Hash a plaintext password.
     * @param password - The plaintext password to hash
     * @returns The bcrypt hash string
     */
    static async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(BCRYPT_COST);
        return await bcrypt.hash(password, salt);
    }

    /**
     * Verify a password against a stored hash.
     * @param password - The plaintext password to verify
     * @param hash - The stored bcrypt hash
     * @returns True if password matches, false otherwise
     */
    static async verify(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}
