import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { AppError } from '../../../shared/infrastructure/errors/app-error.ts';

// Secret key should come from environment
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'dev-secret-do-not-use-prox';

export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
        // Decide if we want to block or just leave user undefined (for optional auth)
        // For 'authMiddleware', we usually enforce it.
        throw AppError.from("UNAUTHORIZED", "Missing Authorization header");
    }

    const [scheme, token] = authHeader.split(' ');

        if (scheme !== 'Bearer' || !token) {
        throw AppError.from("UNAUTHORIZED", "Invalid Authorization header format");
    }

    try {
        const payload = await verify(token, JWT_SECRET, "HS256");
        const jti = (payload as any).jti;
        const userId = payload.sub as string;

        // Dynamic Dependencies import
        const { db } = await import('../database/db.ts');
        const { sql } = await import('kysely');

        // 1. Session Check (Reference Token)
        // Verify token is active in DB
        const session = await db.selectFrom('access_tokens')
            .select('id')
            .where('id', '=', jti)
            .where('expires_at', '>', new Date())
            .executeTakeFirst();

        if (!session) {
             throw AppError.from("UNAUTHORIZED", "Session revoked or expired");
        }

        // 2. Hydrate Permissions Dynamically
        // We do NOT trust the token for scopes. We calculate them now.
        const permissionsResult = await sql<{ scope: string }>`
            SELECT scope FROM get_effective_permissions(${userId})
        `.execute(db);
        
        const scopes = permissionsResult.rows.map(r => r.scope);
        
        // Context User Object
        const user = {
            id: userId,
            tenantId: payload.tenant_id as string,
            email: payload.email as string,
            scopes: scopes, // Dynamic
            jti: jti        // Session ID for Logout
        };

        c.set('user', user);
        
        await next();
    } catch (e) {
        console.error("JWT Verification Error:", e);
        if (e instanceof AppError) throw e;
        throw AppError.from("UNAUTHORIZED", "Invalid or expired token");
    }
});
