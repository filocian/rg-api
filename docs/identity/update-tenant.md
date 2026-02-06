# Update Tenant

Update details of an existing tenant.

## Usage

```txt
PATCH /tenants/:tenantId
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Payload**:

```json
{
  "name": "Acme Corp Updated"
}
```

- `name` (optional): New display name.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "tenant-uuid",
    "name": "Acme Corp Updated",
    "slug": "acme",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

## Logic

1. **Validation**: Validates payload using Zod.
2. **Command**: Dispatches `UpdateTenantCommand`.
3. **Update**: Updates tenant in database.
4. **Not Found**: If DB update fails to find record, throws `AppError(NOT_FOUND)`.
5. **Success**: Returns updated tenant object.

## Implementation

- **Endpoint**: [`patch.update-tenant.endpoint.ts`](../../../src/identity/features/update-tenant/patch.update-tenant.endpoint.ts)
- **Handler**: [`update-tenant.handler.ts`](../../../src/identity/features/update-tenant/update-tenant.handler.ts)
- **Command**: [`update-tenant.command.ts`](../../../src/identity/features/update-tenant/update-tenant.command.ts)
