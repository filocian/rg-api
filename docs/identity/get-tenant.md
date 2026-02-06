# Get Tenant

Retrieve details of a specific tenant by its slug.

## Usage

```txt
GET /tenants/:slug
Authorization: Bearer <accessToken>
```

- `slug` (path param): The unique identifier of the tenant.

### Response (200 OK)

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

1. **Repo Lookup**: Finds tenant by `slug` in database.
2. **Not Found**: If no tenant exists, throws `AppError(NOT_FOUND)`.
3. **Success**: Returns tenant details.

## Implementation

- **Endpoint**: [`get.get-tenant.endpoint.ts`](../../../src/identity/features/get-tenant/get.get-tenant.endpoint.ts)
- **Repository**: Uses `SqlTenantRepository` directly (read-only operation).

## Tests

(Integration tests available or covered by CRUD scenarios)
