import { Context, Next } from "hono";
import { TenantContext } from "../../kernel/multi-tenancy/tenant-context.ts";
import { AppError } from "../errors/app-error.ts";
import { MockRegionMetadataStore } from "../multi-tenancy/mock-region-metadata-store.ts";
import { AppVariables } from "./context.middleware.ts";

// In a real DI scenario, this would be injected.
// For now, we instantiate the mock store directly.
const regionStore = new MockRegionMetadataStore();

export const regionMiddleware = async (c: Context<{ Variables: AppVariables }>, next: Next) => {
    const tenantId = c.get('tenantId');
    
    // If no tenant identified (anonymous), skip region resolution.
    // Endpoints requiring DB access will likely enforce tenant check anyway.
    if (!tenantId || tenantId === 'anonymous') {
         await next();
         return;
    }

    const region = await regionStore.resolveRegion(tenantId);
    
    if (!region) {
        // If a tenantId is provided but no region is found, it's an invalid tenant configuration.
        // We throw 403 or 400.
        throw AppError.from("PERMISSION_DENIED", `Region configuration not found for tenant: ${tenantId}`);
    }

    const tenantContext = new TenantContext(tenantId, region);
    c.set('tenantContext', tenantContext);

    await next();
}
