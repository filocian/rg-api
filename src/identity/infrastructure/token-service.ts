import { sign, verify } from 'hono/jwt';
import { AppError } from '../../shared/infrastructure/errors/app-error.ts';

type JwtAlgorithm = "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512" | "PS256" | "PS384" | "PS512" | "ES256" | "ES384" | "ES512" | "EdDSA";

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'dev-secret-do-not-use-prod';
const JWT_ALGORITHM = (Deno.env.get('JWT_ALGORITHM') || 'HS256') as JwtAlgorithm;

export interface TokenPayload {
    sub: string;       // User ID
    jti: string;       // Token ID (Session ID)
    email: string;     // User Email
    tenantId: string;  // Tenant ID
    exp?: number;      // Expiration
}

export class TokenService {
    static async generate(payload: Omit<TokenPayload, 'exp'>): Promise<string> {
        const now = Math.floor(Date.now() / 1000);
        // Default 1 hour expiration
        const exp = now + 60 * 60; 

        return await sign({ ...payload, exp }, JWT_SECRET, JWT_ALGORITHM);
    }

    static async verify(token: string): Promise<TokenPayload> {
        try {
            return await verify(token, JWT_SECRET, JWT_ALGORITHM) as unknown as TokenPayload;
        } catch (_e) {
            throw AppError.from("UNAUTHORIZED", "Invalid token");
        }
    }
}
