# Multi-Region Architecture

Este documento explica cómo funciona la arquitectura multi-región en rg-api, permitiendo servir a tenants desde diferentes bases de datos regionales.

## Conceptos Clave

### RegionId (Value Object)
Define una región soportada por el sistema.

**Ubicación:** `src/shared/kernel/multi-tenancy/region.ts`

```typescript
import { RegionId } from "../shared/kernel/multi-tenancy/region.ts";

// Usar regiones predefinidas
const euRegion = RegionId.EU;
const usRegion = RegionId.US;

// Crear dinámicamente (valida contra SUPPORTED_REGIONS)
const region = RegionId.create("EU");
```

**Configuración:** Variable de entorno `SUPPORTED_REGIONS` (default: `EU,US`)

---

### TenantContext
Encapsula el contexto del tenant actual: su ID y la región donde residen sus datos.

**Ubicación:** `src/shared/kernel/multi-tenancy/tenant-context.ts`

```typescript
import { TenantContext } from "../shared/kernel/multi-tenancy/tenant-context.ts";

const context = new TenantContext(tenantId, region);
// context.tenantId -> string
// context.regionId -> RegionId
```

---

### DataRouter
Gestiona conexiones a bases de datos por región. Cada región tiene su propia conexión Postgres.

**Ubicación:** `src/shared/infrastructure/database/data-router.ts`

```typescript
import { PostgresDataRouter } from "../shared/infrastructure/database/data-router.ts";

const dataRouter = new PostgresDataRouter();

// Obtener conexión para una región
const db = await dataRouter.getConnection(context.regionId);

// Usar Kysely normalmente
const users = await db.selectFrom('users').selectAll().execute();
```

**Configuración:** Variables de entorno `DATABASE_URL_<REGION>`:
```env
DATABASE_URL_EU=postgres://user:pass@eu-db:5432/rgdb
DATABASE_URL_US=postgres://user:pass@us-db:5432/rgdb
```

---

## Flujo de una Request

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Handler
    participant DataRouter
    participant DB_EU
    participant DB_US

    Client->>Middleware: POST /login {slug: "acme"}
    Middleware->>Middleware: Extract tenantId from JWT/slug
    Middleware->>Middleware: Resolve region for tenant
    Middleware->>Middleware: Create TenantContext
    Middleware->>Handler: context.regionId = EU
    Handler->>DataRouter: getConnection(EU)
    DataRouter->>DB_EU: Query
    DB_EU-->>Handler: Result
    Handler-->>Client: Response
```

---

## Ejemplo: LoginHandler

El `LoginHandler` demuestra el patrón completo de multi-región:

```typescript
// src/identity/features/login/login.handler.ts

async handle(command: LoginCommand) {
    const { email, password, slug } = command;

    // 1. Resolver Tenant (sin región aún)
    const tenant = await this.tenantRepo.findBySlug(slug);
    
    // 2. Resolver Región del tenant
    const region = await this.regionResolver.resolveRegion(tenant.id);
    
    // 3. Crear TenantContext
    const context = new TenantContext(tenant.id, region);

    // 4. Buscar usuario EN LA REGIÓN CORRECTA
    const user = await this.userRepo.findByEmail(email, context);
    
    // ... resto de la lógica
}
```

---

## Ejemplo: Repository con TenantContext

Los repositorios reciben `TenantContext` para obtener la conexión correcta:

```typescript
// src/identity/infrastructure/repositories/sql-user.repository.ts

export class SqlUserRepository implements IUserRepository {
    constructor(private dataRouter: IDataRouter) {}

    async findByEmail(email: string, context: TenantContext): Promise<User | null> {
        // Obtener conexión de la región del tenant
        const db = await this.dataRouter.getConnection(context.regionId);
        
        return await db.selectFrom('users')
            .selectAll()
            .where('email', '=', email)
            .executeTakeFirst();
    }
}
```

---

## Middleware de Región

El `regionMiddleware` inyecta automáticamente el `TenantContext` para requests autenticados:

```typescript
// src/shared/infrastructure/middleware/region.middleware.ts

export const regionMiddleware = async (c: Context, next: Next) => {
    const tenantId = c.get('tenantId');
    
    if (!tenantId || tenantId === 'anonymous') {
        await next();
        return;
    }

    const region = await regionStore.resolveRegion(tenantId);
    const tenantContext = new TenantContext(tenantId, region);
    
    c.set('tenantContext', tenantContext);
    await next();
}
```

**Uso en endpoints:**
```typescript
const context = c.get('tenantContext');
const user = await userRepo.findById(id, context);
```

---

## Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SUPPORTED_REGIONS` | Regiones soportadas | `EU,US,ASIA` |
| `DATABASE_URL_EU` | Conexión DB Europa | `postgres://...` |
| `DATABASE_URL_US` | Conexión DB USA | `postgres://...` |

### Agregar Nueva Región

1. Agregar región a `SUPPORTED_REGIONS`
2. Configurar `DATABASE_URL_<REGION>`
3. Configurar mapeo tenant→región en `MockRegionMetadataStore` (o implementar store real)

---

## Principios de Diseño

1. **Data Sovereignty**: Los datos de cada tenant permanecen en su región
2. **Handler Agnosticism**: Los handlers no conocen detalles de conexión
3. **Single Responsibility**: DataRouter solo gestiona conexiones
4. **Lazy Loading**: Conexiones se crean bajo demanda
