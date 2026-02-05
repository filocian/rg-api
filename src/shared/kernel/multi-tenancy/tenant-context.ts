import { RegionId } from "./region.ts";

export class TenantContext {
    constructor(
        public readonly tenantId: string,
        public readonly regionId: RegionId
    ) {}
}
