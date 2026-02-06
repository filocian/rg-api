# Get Permissions

Retrieve the effective list of permissions for the current authenticated user.

## Usage

```txt
GET /permissions
Authorization: Bearer <accessToken>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "scopes": [
      "identity.tenants.read",
      "identity.users.manage"
    ]
  }
}
```

## Logic

1. **Context**: Identifies user from `Bearer` token.
2. **Calculation**: Calls stored procedure (or repo method) to calculate effective permissions based on user's roles and tenant association.
3. **Return**: List of permission strings.

## Implementation

- **Endpoint**: [`get.get-permissions.endpoint.ts`](../../../src/identity/features/get-permissions/get.get-permissions.endpoint.ts)
- **Repository**: `SqlPermissionRepository.getEffectivePermissions`
