# Update Role

Update an existing role's details.

## Usage

```txt
PATCH /roles/:roleId
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Payload**:

```json
{
  "name": "Senior Manager"
}
```

- `name` (optional): New name for the role.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "role-uuid",
    "name": "Senior Manager"
  }
}
```

## Logic

1. **Validation**: Validates request body.
2. **Command**: Dispatches `UpdateRoleCommand`.
3. **Update**: Updates role record in database.
4. **Not Found**: Throws `AppError(NOT_FOUND)` if role doesn't exist.
5. **Success**: Returns updated role.

## Implementation

- **Endpoint**: [`patch.update-role.endpoint.ts`](../../../src/identity/features/update-role/patch.update-role.endpoint.ts)
- **Handler**: [`update-role.handler.ts`](../../../src/identity/features/update-role/update-role.handler.ts)
- **Command**: [`update-role.command.ts`](../../../src/identity/features/update-role/update-role.command.ts)
