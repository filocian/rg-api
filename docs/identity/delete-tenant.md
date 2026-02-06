# Delete Tenant

Permanently delete a tenant organization.

## Usage

```txt
DELETE /tenants/:tenantId
Authorization: Bearer <accessToken>
```

- `tenantId` (path param): ID of the tenant to delete.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Tenant deleted"
  }
}
```

## Logic

1. **Command**: Dispatches `DeleteTenantCommand`.
2. **Delete**: Executes delete operation in repository.
3. **Success**: Returns 200 OK even if tenant didn't exist (idempotent behavior in current implementation).

## Implementation

- **Endpoint**: [`delete.delete-tenant.endpoint.ts`](../../../src/identity/features/delete-tenant/delete.delete-tenant.endpoint.ts)
- **Handler**: [`delete-tenant.handler.ts`](../../../src/identity/features/delete-tenant/delete-tenant.handler.ts)
- **Command**: [`delete-tenant.command.ts`](../../../src/identity/features/delete-tenant/delete-tenant.command.ts)
