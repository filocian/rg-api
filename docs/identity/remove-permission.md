# Remove Permission

Revoke a permission from a role.

## Usage

```txt
DELETE /roles/:roleId/permissions/:scope
Authorization: Bearer <accessToken>
```

- `roleId` (path param): UUID of the role.
- `scope` (path param): Permission scope (URL Encoded).

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Permission removed"
  }
}
```

## Logic

1. **Decoding**: Decodes the `scope` parameter from URL.
2. **Command**: Dispatches `RemovePermissionCommand`.
3. **Execution**: Removes the link between role and permission in database.
4. **Idempotency**: Returns success even if permission was not assigned (safe).

## Implementation

- **Endpoint**: [`delete.remove-permission.endpoint.ts`](../../../src/identity/features/remove-permission/delete.remove-permission.endpoint.ts)
- **Handler**: [`remove-permission.handler.ts`](../../../src/identity/features/remove-permission/remove-permission.handler.ts)
- **Command**: [`remove-permission.command.ts`](../../../src/identity/features/remove-permission/remove-permission.command.ts)
