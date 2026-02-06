# Shared Infrastructure

Core infrastructure components shared across the API.

## API Envelope

**Location:** `src/shared/infrastructure/api/envelope.ts`

Standardizes all API responses.

### successResponse

```typescript
import { successResponse } from "../shared/infrastructure/api/envelope.ts";

// In endpoint:
return c.json(successResponse(user, { cached: false }));

// Result:
// {
//   "success": true,
//   "data": { "id": "123", "email": "user@example.com" },
//   "meta": { "timestamp": "...", "cached": false }
// }
```

### errorResponse

```typescript
import { errorResponse } from "../shared/infrastructure/api/envelope.ts";

const error = AppError.from("UNAUTHORIZED", "Invalid token");
return c.json(errorResponse(error, traceId), error.httpStatus);

// Result:
// {
//   "success": false,
//   "error": { "code": "UNAUTHORIZED", "message": "Invalid token", "traceId": "..." }
// }
```

## AppError

**Location:** `src/shared/infrastructure/errors/app-error.ts`

Universal typed error with severity, HTTP status, and details.

### Creating Errors

```typescript
import { AppError } from "../shared/infrastructure/errors/app-error.ts";

// Generic
throw AppError.from("CONFLICT", "User already exists");

// With typed details
throw AppError.from<{ field: string }>("VALIDATION_ERROR", "Invalid input", {
    details: { field: "email" },
    httpStatus: 422
});

// Factory methods
throw AppError.validation({ email: "required" });
throw AppError.notFound("User not found");
throw AppError.fatal("Database connection failed", originalError);
```

### Normalizing Unknown Errors

```typescript
try {
    await riskyOperation();
} catch (error) {
    // Guarantees an AppError
    const appError = AppError.normalize(error);
    logger.error(appError);
    throw appError;
}
```

### Error Codes

| Code | HTTP | Usage |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `PERMISSION_DENIED` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | State conflict (e.g. duplicate) |
| `INTERNAL_ERROR` | 500 | System error |

## Logger

**Location:** `src/shared/infrastructure/logging/logger.ts`

Structured logging system with multiple transports (Console, File).

### Usage

```typescript
import { logger } from "../shared/infrastructure/logging/logger.ts";

// Info
logger.info("USER_LOGIN", "User logged in", { userId: "123" });

// Warning
logger.warn("RATE_LIMIT", "Approaching rate limit", { requests: 95 });

// Error with AppError
const error = AppError.from("DB_ERROR", "Connection timeout");
logger.error(error, { traceId: c.get('traceId') });
```

## Cache (Deno KV)

**Location:** `src/shared/infrastructure/cache/deno-kv-cache.ts`

```typescript
import { DenoKvCache } from "../shared/infrastructure/cache/deno-kv-cache.ts";

const cache = new DenoKvCache();
await cache.init();

await cache.set("user:123", userData, 3600); // 1 hour
const user = await cache.get<User>("user:123");
await cache.delete("user:123");
```

## Middlewares

**Location:** `src/shared/infrastructure/middleware/`

| Middleware | Purpose |
| :--- | :--- |
| `regionMiddleware` | Injects `TenantContext` into authenticated requests |
| `contextMiddleware` | Extracts `tenantId`, `traceId` from request header/token |

## Dispatcher (Event Bus)

**Location:** `src/shared/infrastructure/bus/dispatcher.ts`

Handles synchronous dispatch of Commands and Queries. Supports **Dependency Injection** for the logger, facilitating side-effect-free testing.

```typescript
// Production (uses default logger)
const dispatcher = new Dispatcher();

// Testing (uses mock logger)
const dispatcher = new Dispatcher(mockLogger);
```

### Tests

`src/shared/infrastructure/dispatcher.test.ts`

- ✅ Command Execution
- ✅ Missing Handler (Error handling)
- ✅ Logger integration (Mocked for isolation)
