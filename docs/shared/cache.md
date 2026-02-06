# Cache System

## Overview

The `rg-api` works with a **Dual-Layer Caching Strategy** to optimize performance and reduce database load.

1. **Shared Cache (L2)**: Distributed, persistent cache using **Deno KV**. Shared across all application instances.
2. **Local Cache (L1)**: Fast, in-memory `Map`. Unique to each instance.

## Architecture

The system is built on the repository pattern, extending a base `CacheableRepository` class.

### Core Components

- **`ICacheStore`**: Interface defining standard cache operations (`get`, `set`, `delete`).
- **`CacheableRepository`**: Abstract base class providing `remember` and `rememberLocal` methods.
- **`DenoKvCache`**: Implementation of `ICacheStore` using Deno KV.
- **`InMemoryCache`**: Implementation of `ICacheStore` using native `Map`.

## Usage Guide

To enable caching in a repository, extend `CacheableRepository`.

### 1. Extending the Repository

```typescript
import { CacheableRepository } from '../../../shared/infrastructure/cache/cacheable.repository.ts';

export class SqlUserRepository extends CacheableRepository implements IUserRepository {
    constructor(
        private dataRouter: IDataRouter,
        cacheStore: ICacheStore,      // Injected DenoKvCache
        localCacheStore: ICacheStore  // Injected InMemoryCache
    ) {
        super(cacheStore, localCacheStore);
    }
}
```

### 2. Caching Data (Read-Through)

Use the `remember` method to wrap data fetching logic. It automatically handles cache hits and misses.

**Shared Cache (Default)**:

```typescript
async findById(id: string, context: TenantContext): Promise<User | null> {
    const key = `user:${context.tenantId}:${id}`;
    
    // Auto-caches result for 300 seconds
    return await this.remember(key, 300, async () => {
        // ... database query ...
        return result;
    });
}
```

**Local Cache**:
Use `rememberLocal` for high-frequency, immutable data that is safe to store per-instance.

```typescript
async getConfig(): Promise<Config> {
    return await this.rememberLocal('global:config', 600, async () => {
        return fetchConfig();
    });
}
```

### 3. Invalidating Cache

When data changes, you **must** invalidate the relevant cache keys to prevent stale data.

```typescript
async update(id: string, data: any, context: TenantContext): Promise<User> {
    // 1. Perform Update
    const result = await db.update(...).execute();

    // 2. Invalidate Key
    const key = `user:${context.tenantId}:${id}`;
    await this.forget(key); 

    return result;
}
```

## Best Practices

### Key Naming Convention

Use colon-separated strings to namespace keys. Always include the `tenantId` for multi-tenant data.

Format: `{entity}:{tenantId}:{id}`

- ✅ `user:tenant-123:user-456`
- ✅ `permissions:tenant-123:role-admin`
- ❌ `user-456` (Collision risk)

### Configuration

The cache system uses environment variables for configuration.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DENO_KV_PATH` | Path to the Deno KV database file. | `undefined` (uses default path) |

## Example Implementation

See `src/identity/infrastructure/repositories/sql-user.repository.ts` for a complete reference implementation.
