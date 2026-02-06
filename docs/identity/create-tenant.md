# Create Tenant

Create a new tenant (organization) in the system.

## Usage

```txt
POST /tenants
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Payload**:

```json
{
  "name": "Acme Corp",
  "slug": "acme"
}
```

- `slug` (required): Unique identifier (3-50 chars, lowercase alphanumeric + dashes).
- `name` (optional): Display name. Defaults to slug if omitted.

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "tenant-uuid",
    "name": "Acme Corp",
    "slug": "acme",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Logic

1. **Validation**: Checks `slug` format and length using Zod.
2. **Command**: Dispatches `CreateTenantCommand`.
3. **Persist**: Tries to insert into `tenants` table.
4. **Conflict**: If slug exists (DB error 23505), throws `AppError(CONFLICT)`.
5. **Success**: Returns created tenant object.

## Implementation

- **Endpoint**: [`post.create-tenant.endpoint.ts`](../../../src/identity/features/create-tenant/post.create-tenant.endpoint.ts)
- **Handler**: [`create-tenant.handler.ts`](../../../src/identity/features/create-tenant/create-tenant.handler.ts)
- **Command**: [`create-tenant.command.ts`](../../../src/identity/features/create-tenant/create-tenant.command.ts)

## Tests

File: [`create-tenant.handler.test.ts`](../../../src/identity/features/create-tenant/create-tenant.handler.test.ts)

| Scenario | Result |
| :--- | :--- |
| Valid payload | Returns new tenant |
| Duplicate slug | Throws `AppError` (CONFLICT) |
| DB Error | Rethrows original error |
