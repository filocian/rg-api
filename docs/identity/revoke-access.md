# Revoke Access

Global logout for a user. Invalidates all existing tokens.

## Usage

```txt
POST /auth/revoke
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Payload** (Optional):

```json
{
  "userId": "user-uuid"
}
```

- `userId`: Defaults to current user if omitted. Requires admin privileges to revoke others.

### Response (200 OK)

```json
{
  "success": true,
  "data": { "message": "All sessions revoked" },
  "meta": { "timestamp": "..." }
}
```

## Logic

1. **Version Increment**: Increments `token_version` on the User record.
2. **Cleanup**: Deletes all Refresh Tokens associated with the user.
3. **Effect**: All existing JWTs immediately become invalid (due to version mismatch check in shared middleware/guard).

## Implementation

- **Endpoint**: [`post.revoke-access.endpoint.ts`](../../../src/identity/features/revoke-access/post.revoke-access.endpoint.ts)
- **Handler**: [`revoke-access.handler.ts`](../../../src/identity/features/revoke-access/revoke-access.handler.ts)
- **Command**: [`revoke-access.command.ts`](../../../src/identity/features/revoke-access/revoke-access.command.ts)

## Tests

File: [`revoke-access.handler.test.ts`](../../../src/identity/features/revoke-access/revoke-access.handler.test.ts)

| Scenario | Result |
| :--- | :--- |
| Global Revocation | `token_version` ++, tokens deleted |
