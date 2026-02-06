# Delete Role

Delete a role from a tenant.

## Usage

```txt
DELETE /roles/:roleId
Authorization: Bearer <accessToken>
```

- `roleId` (path param): UUID of the role to delete.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Role deleted"
  }
}
```

## Logic

1. **Command**: Dispatches `DeleteRoleCommand`.
2. **Delete**: Removes role from database.
3. **Success**: Returns success message.

## Implementation

- **Endpoint**: [`delete.delete-role.endpoint.ts`](../../../src/identity/features/delete-role/delete.delete-role.endpoint.ts)
- **Handler**: [`delete-role.handler.ts`](../../../src/identity/features/delete-role/delete-role.handler.ts)
- **Command**: [`delete-role.command.ts`](../../../src/identity/features/delete-role/delete-role.command.ts)
