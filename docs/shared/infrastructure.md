# Shared Infrastructure

Componentes de infraestructura compartidos en toda la API.

## API Envelope

**Ubicación:** `src/shared/infrastructure/api/envelope.ts`

Estandariza todas las respuestas de la API.

### successResponse

```typescript
import { successResponse } from "../shared/infrastructure/api/envelope.ts";

// En un endpoint:
return c.json(successResponse(user, { cached: false }));

// Resultado:
// {
//   "success": true,
//   "data": { "id": "123", "email": "user@example.com" },
//   "meta": { "timestamp": "2024-01-15T10:30:00Z", "cached": false }
// }
```

### errorResponse

```typescript
import { errorResponse } from "../shared/infrastructure/api/envelope.ts";

const error = AppError.from("UNAUTHORIZED", "Invalid token");
return c.json(errorResponse(error, traceId), error.httpStatus);

// Resultado:
// {
//   "success": false,
//   "error": { "code": "UNAUTHORIZED", "message": "Invalid token", "traceId": "..." }
// }
```

---

## AppError

**Ubicación:** `src/shared/infrastructure/errors/app-error.ts`

Error universal tipado con severidad, código HTTP y detalles.

### Crear errores

```typescript
import { AppError } from "../shared/infrastructure/errors/app-error.ts";

// Genérico
throw AppError.from("CONFLICT", "User already exists");

// Con detalles tipados
throw AppError.from<{ field: string }>("VALIDATION_ERROR", "Invalid input", {
    details: { field: "email" },
    httpStatus: 422
});

// Factory methods especializados
throw AppError.validation({ email: "required" });
throw AppError.notFound("User not found");
throw AppError.fatal("Database connection failed", originalError);
```

### Normalizar errores desconocidos

```typescript
try {
    await riskyOperation();
} catch (error) {
    // Garantiza un AppError
    const appError = AppError.normalize(error);
    logger.error(appError);
    throw appError;
}
```

### Códigos de error disponibles

| Código | HTTP | Uso |
|--------|------|-----|
| `VALIDATION_ERROR` | 422 | Datos inválidos |
| `UNAUTHORIZED` | 401 | No autenticado |
| `PERMISSION_DENIED` | 403 | Sin permisos |
| `RESOURCE_NOT_FOUND` | 404 | Recurso no existe |
| `CONFLICT` | 409 | Conflicto de estado |
| `INTERNAL_ERROR` | 500 | Error del sistema |

---

## Logger

**Ubicación:** `src/shared/infrastructure/logging/logger.ts`

Sistema de logging estructurado con múltiples transportes (Console, File).

### Uso básico

```typescript
import { logger } from "../shared/infrastructure/logging/logger.ts";

// Info
logger.info("USER_LOGIN", "User logged in", { userId: "123" });

// Warning
logger.warn("RATE_LIMIT", "Approaching rate limit", { requests: 95 });

// Error con AppError
const error = AppError.from("DB_ERROR", "Connection timeout");
logger.error(error, { traceId: c.get('traceId') });

// Error manual
logger.error("PAYMENT_FAILED", "Payment processing failed", error, { orderId }, "Event");

// Fatal (system crash)
logger.fatal("SYSTEM_CRASH", "Unrecoverable error", fatalError);
```

### Contexto

```typescript
logger.info("ORDER_CREATED", "New order", { orderId }, "Event", {
    traceId: "abc-123",
    tenantId: "tenant-456",
    userId: "user-789"
});
```

---

## Cache (Deno KV)

**Ubicación:** `src/shared/infrastructure/cache/deno-kv-cache.ts`

```typescript
import { DenoKvCache } from "../shared/infrastructure/cache/deno-kv-cache.ts";

const cache = new DenoKvCache();
await cache.init();

await cache.set("user:123", userData, 3600); // 1 hora
const user = await cache.get<User>("user:123");
await cache.delete("user:123");
```

---

## DataRouter (Multi-Región)

Ver [multi-region.md](./multi-region.md) para documentación completa.

```typescript
import { PostgresDataRouter } from "../shared/infrastructure/database/data-router.ts";

const dataRouter = new PostgresDataRouter();
const db = await dataRouter.getConnection(context.regionId);
```

---

## Middlewares

**Ubicación:** `src/shared/infrastructure/middleware/`

| Middleware | Propósito |
|------------|-----------|
| `regionMiddleware` | Inyecta `TenantContext` en requests autenticados |
| `contextMiddleware` | Extrae `tenantId`, `traceId` del request |

```typescript
import { regionMiddleware } from "../shared/infrastructure/middleware/region.middleware.ts";

app.use("*", regionMiddleware);

// En endpoint:
const context = c.get('tenantContext');
```

---

## Dispatcher (Event Bus)

**Ubicación:** `src/shared/infrastructure/bus/dispatcher.ts`

Maneja el despacho sincrónico de Commands y Queries. Soporta **Dependency Injection** para el logger, facilitando el testing sin efectos secundarios.

```typescript
// Producción (usa logger default)
const dispatcher = new Dispatcher();

// Testing (usa mock logger)
const dispatcher = new Dispatcher(mockLogger);
```

### Tests

`src/shared/infrastructure/dispatcher.test.ts`
- ✅ Command Execution
- ✅ Missing Handler (Error handling)
- ✅ Logger integration (Mocked for isolation)

`src/shared/infrastructure/logging/logger.test.ts`
- ✅ Info/Warn/Error logging
- ✅ AppError serialization
- ✅ Fatal error handling

