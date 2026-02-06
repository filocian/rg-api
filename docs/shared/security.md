# Security Module

Handles hashing, tokens, and encryption.

## Password Service

**Location:** `src/shared/infrastructure/security/password.service.ts`

### Hashing

Uses **bcrypt** for password hashing.

- **Config**: `BCRYPT_COST` (env var).
- **Hardening**: Service enforces a **minimum cost of 4** to prevent library errors and cryptographic weakness.

### Usage

```typescript
// Hash
const hash = await PasswordService.hash("mypassword");

// Verify
const isValid = await PasswordService.verify("mypassword", hash);
```

## Token Service

**Location:** `src/identity/infrastructure/token-service.ts`

Handles generation and validation of JWTs.

- **Algorithm**: HS256 (default)
- **Expiration**:
  - Access Token: 15 min
  - Refresh Token: 7 days (rotation)
