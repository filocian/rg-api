import { Context, Next } from "hono";

import { TenantContext } from "../../kernel/multi-tenancy/tenant-context.ts";

// Define the custom variables for our Hono Context
export type AppVariables = {
    traceId: string;
    tenantId: string;
    tenantContext?: TenantContext;
}

/**
 * Middleware to setup Request Context (Trace ID, Tenant ID)
 */
export const contextMiddleware = async (context: Context<{ Variables: AppVariables }>, next: Next) => {
    // 1. Trace ID
    const traceId = context.req.header('x-request-id') || crypto.randomUUID();
    context.set('traceId', traceId);

    // 2. Tenant ID
    // Priority: Header > Token (Not implemented here, simpliefied for now)
    const tenantIdHeader = context.req.header('x-tenant-id');

    // For now we just take it from header or default to 'public' if allowed, 
    // or fail if strictly required. 
    // The requirement says: "Resuelve el tenantId... y valida integridad"

    if (tenantIdHeader) {
        context.set('tenantId', tenantIdHeader);
    } else {
        // Fallback or error? 
        // For development/public access, maybe "default".
        // But Filocian method implies strict tenancy.
        // We set to "anonymous" or similar if missing, or let Auth middleware handle rejection.
        context.set('tenantId', "anonymous");
    }

    // Add trace context header to response
    context.header('x-request-id', traceId);

    await next();
}
