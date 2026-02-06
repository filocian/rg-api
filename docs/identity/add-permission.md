# Add Permission

Assign a permission to a role.

## Usage

```txt
POST /roles/:roleId/permissions
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Payload**:

```json
{
  "scope": "identity.tenants.create"
}
```

- `scope` (required): The permission scope string (e.g., `namespace.resource.action`).

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Permission added"
  }
}
```

## Logic

1. **Validation**: Checks `scope` format (`namespace.resource.action`).
2. **Verification**:
    - Verifies `scope` exists in system.
    - Verifies `roleId` exists.
3. **Command**: Dispatches `AddPermissionCommand`.
4. **Assignment**: Links permission to role in `role_permissions` table (via repository).
5. **Success**: Returns success message.

## Implementation

- **Endpoint**: [`post.add-permission.endpoint.ts`](../../../src/identity/features/add-permission/post.add-permission.endpoint.ts)
- **Handler**: [`add-permission.handler.ts`](../../../src/identity/features/add-permission/add-permission.handler.ts)
- **Command**: [`add-permission.command.ts`](../../../src/identity/features/add-permission/add-permission.command.ts)
