import { RegionId } from "../../kernel/multi-tenancy/region.ts";
import { ITenantRegionResolver } from "../../kernel/multi-tenancy/tenant-region-resolver.ts";

export class MockRegionMetadataStore implements ITenantRegionResolver {
    private tenantMap: Map<string, RegionId>;

    constructor() {
        this.tenantMap = new Map();
        // Seed mock data for development
        this.tenantMap.set("tenant-eu", RegionId.EU);
        this.tenantMap.set("tenant-us", RegionId.US);
    }

    async resolveRegion(tenantId: string): Promise<RegionId | null> {
        // Simulating async DB lookup
        return Promise.resolve(this.tenantMap.get(tenantId) || null);
    }

    // Helper to seed data for tests
    public setTenant(tenantId: string, region: RegionId) {
        this.tenantMap.set(tenantId, region);
    }
}
