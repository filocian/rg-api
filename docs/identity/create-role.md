# Create Role

Create a new role within a tenant.

## Usage

```txt
POST /roles
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Payload**:

```json
{
  "name": "Manager",
  "parentRoleId": "optional-parent-uuid"
}
```

- `name` (required): Name of the role (1-50 chars).
- `parentRoleId` (optional): UUID of the parent role (for inheritance).

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "role-uuid",
    "tenantId": "tenant-uuid",
    "name": "Manager",
    "parentRoleId": "optional-parent-uuid"
  }
}
```

## Logic

1. **Validation**: Validates `name` and optional `parentRoleId`.
2. **Context**: Extracts `tenantId` from authenticated user's token.
3. **Command**: Dispatches `CreateRoleCommand`.
4. **Creation**: Inserts role into database linked to the tenant.
5. **Conflict**: If role name exists in tenant, throws `AppError(CONFLICT)`.
6. **Success**: Returns created role.

## Implementation

- **Endpoint**: [`post.create-role.endpoint.ts`](../../../src/identity/features/create-role/post.create-role.endpoint.ts)
- **Handler**: [`create-role.handler.ts`](../../../src/identity/features/create-role/create-role.handler.ts)
- **Command**: [`create-role.command.ts`](../../../src/identity/features/create-role/create-role.command.ts)
