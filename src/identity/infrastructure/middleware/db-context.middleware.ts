import { createMiddleware } from 'hono/factory';
import { sql } from 'kysely';
import { db } from '../database/db.ts';

/**
 * Middleware that injects the current Tenant ID into the Database Session.
 * This is CRITICAL for RLS (Row Level Security) to work.
 * 
 * It expects 'user' to be present in the Hono context (set by AuthMiddleware).
 */
export const dbContextMiddleware = createMiddleware(async (c, next) => {
    const user = c.get('user');

    if (user && user.tenantId) {
        // We use a transaction to ensure SET LOCAL only applies to this operation
        // and is cleaned up afterwards.
        // However, Kysely's transaction model requires us to pass the 'trx' object 
        // down to repositories.
        // For simplicity in this slice, we will set it on the connection if possible,
        // or attach the transaction object to the Hono context.
        
        await db.transaction().execute(async (trx) => {
            try {
                // Inject tenant_id into Postgres session
                await sql`
                    SELECT set_config('app.current_tenant', ${user.tenantId}, true)
                `.execute(trx);

                // Attach the Transaction-scoped DB client to the context
                // Services/Handlers MUST use c.get('db') instead of the global 'db' import
                c.set('db', trx);
                
                await next();
            } catch (error) {
                // If next() throws, the transaction will rollback automatically by Kysely
                throw error;
            }
        });
    } else {
        // No user, no RLS context needed (or public access)
        // Pass the global db instance (or a restricted one)
        c.set('db', db);
        await next();
    }
});
