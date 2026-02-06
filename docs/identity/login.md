# Login

Authenticate user credentials and issue access/refresh tokens.

## Usage

```txt
POST /auth/login
Content-Type: application/json
```

**Payload**:

```json
{
  "email": "user@example.com",
  "password": "secret123",
  "slug": "acme"
}
```

- `email` (required): User email.
- `password` (required): User password.
- `slug` (required): Tenant slug.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "uuid-refresh-token"
  },
  "meta": { "timestamp": "..." }
}
```

## Logic

1. **Resolver**: Resolves tenant by `slug` and determines its region.
2. **Context**: Sets `TenantContext` to connect to correct regional DB.
3. **Lookup**: Finds user by email in the regional DB.
4. **Verification**: Verifies password using bcrypt.
5. **Token Generation**:
    - Creates **Refresh Token** (7 days validity).
    - Creates **Access Token** (JWT, 15 min validity).
6. **Success**: Returns both tokens.

## Implementation

- **Endpoint**: [`post.login.endpoint.ts`](../../../src/identity/features/login/post.login.endpoint.ts)
- **Handler**: [`login.handler.ts`](../../../src/identity/features/login/login.handler.ts)
- **Command**: [`login.command.ts`](../../../src/identity/features/login/login.command.ts)

## Tests

File: [`login.handler.test.ts`](../../../src/identity/features/login/login.handler.test.ts)

| Scenario | Result |
| :--- | :--- |
| Successful Login | Returns keys |
| Tenant Not Found | 401 Unauthorized |
| Region Error | 500 Internal Error |
| User Not Found | 401 Unauthorized |
| Wrong Password | 401 Unauthorized |
