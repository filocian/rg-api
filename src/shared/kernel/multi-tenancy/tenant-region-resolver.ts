import { RegionId } from "./region.ts";

export interface ITenantRegionResolver {
    resolveRegion(tenantId: string): Promise<RegionId | null>;
}
