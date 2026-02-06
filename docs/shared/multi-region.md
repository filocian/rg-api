# Multi-Region Architecture

Architecture enabling the API to serve tenants from different regional databases.

## Key Concepts

### RegionId (Value Object)

Defines a region supported by the system.

**Location:** `src/shared/kernel/multi-tenancy/region.ts`

```typescript
import { RegionId } from "../shared/kernel/multi-tenancy/region.ts";

const euRegion = RegionId.EU;
const usRegion = RegionId.US;
```

**Config:** `SUPPORTED_REGIONS` env var (default: `EU,US`).

### TenantContext

Encapsulates the current tenant's context (ID and Region).

**Location:** `src/shared/kernel/multi-tenancy/tenant-context.ts`

```typescript
const context = new TenantContext(tenantId, region);
```

### DataRouter

Manages database connections by region. Each region has its own Postgres connection.

**Location:** `src/shared/infrastructure/database/data-router.ts`

```typescript
const db = await dataRouter.getConnection(context.regionId);
```

## Request Flow

1. **Client**: `POST /login {slug: "acme"}`
2. **Middleware**: Resolves tenant region.
3. **Context**: Creates `TenantContext` with `RegionId=EU`.
4. **Handler**: Receives context.
5. **Repository**: Asks `DataRouter` for `EU` connection.
6. **DB_EU**: Executes query.

## Example: LoginHandler

Demonstrates the pattern:

```typescript
// 1. Resolve Tenant (no region yet)
const tenant = await this.tenantRepo.findBySlug(slug);

// 2. Resolve Region
const region = await this.regionResolver.resolveRegion(tenant.id);

// 3. Create Context
const context = new TenantContext(tenant.id, region);

// 4. Find User in CORRECT REGION
const user = await this.userRepo.findByEmail(email, context);
```

## Configuration

| Variable | Description | Example |
| :--- | :--- | :--- |
| `SUPPORTED_REGIONS` | Supported regions list | `EU,US` |
| `DATABASE_URL_EU` | EU Database Connection | `postgres://...` |
| `DATABASE_URL_US` | US Database Connection | `postgres://...` |

## Design Principles

1. **Data Sovereignty**: Tenant data stays in its region.
2. **Handler Agnosticism**: Handlers don't know connection details.
3. **Lazy Loading**: Connections created on demand.
