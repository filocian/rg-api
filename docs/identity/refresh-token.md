# Refresh Token

Obtain a new Access Token using a valid Refresh Token.

## Usage

```txt
POST /auth/refresh
Content-Type: application/json
```

**Payload**:

```json
{
  "refreshToken": "uuid-refresh-token"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci..."
  },
  "meta": { "timestamp": "..." }
}
```

## Logic

1. **Lookup**: Hashes provided token and looks it up in DB.
2. **Validation**:
    - Checks expiration date.
    - Checks `token_version` match with user's current version.
3. **Rotation**:
    - Invalidates old Refresh Token.
    - Generates new Refresh Token (optional, depends on security policy).
    - Generates new Access Token.
4. **Success**: Returns new Access Token.

## Implementation

- **Endpoint**: [`post.refresh-token.endpoint.ts`](../../../src/identity/features/refresh-token/post.refresh-token.endpoint.ts)
- **Handler**: [`refresh-token.handler.ts`](../../../src/identity/features/refresh-token/refresh-token.handler.ts)
- **Command**: [`refresh-token.command.ts`](../../../src/identity/features/refresh-token/refresh-token.command.ts)

## Tests

File: [`refresh-token.handler.test.ts`](../../../src/identity/features/refresh-token/refresh-token.handler.test.ts)

| Scenario | Result |
| :--- | :--- |
| Success | New Access Token |
| Expired Token | 401 Unauthorized |
| Version Mismatch | 403 Forbidden |
