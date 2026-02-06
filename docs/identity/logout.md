# Logout

Invalidate the current user session (Access Token).

## Usage

```txt
POST /auth/logout
Authorization: Bearer <accessToken>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": { "message": "Session revoked" },
  "meta": { "timestamp": "..." }
}
```

## Logic

1. **Extraction**: Extracts Session ID (`jti`) from JWT.
2. **Invalidation**: Marks the Access Token as revoked in the database (or removes it from whitelist, depending on strategy).
3. **Success**: Confirms session revocation.

> **Note**: This does not invalidate the Refresh Token. To fully revoke access, use [`Revoke Access`](./revoke-access.md).

## Implementation

- **Endpoint**: [`post.logout.endpoint.ts`](../../../src/identity/features/logout/post.logout.endpoint.ts)
- **Handler**: [`logout.handler.ts`](../../../src/identity/features/logout/logout.handler.ts)
- **Command**: [`logout.command.ts`](../../../src/identity/features/logout/logout.command.ts)

## Tests

File: [`logout.handler.test.ts`](../../../src/identity/features/logout/logout.handler.test.ts)

| Scenario | Result |
| :--- | :--- |
| Successful Logout | Session revoked |
