# Database Module

El módulo de base de datos utiliza **PostgreSQL** y **Kysely** como query builder.

## Migraciones

Las migraciones se encuentran en `src/identity/infrastructure/database/migrations`.

### Versionado

- **v1.0 (Unified)**: `v1.0_init_identity.ts`
    - Contiene la estructura inicial completa para Identity (Tenants, Users, Roles, Permissions, Tokens).
    - Reemplaza las migraciones antiguas (`001`, `002`, `003`).

### Ejecución

Para ejecutar las migraciones:

```bash
# Desde el host (vía Docker)
docker compose exec rg-api deno run --allow-all scripts/migrate.ts
```

## Seeders

Los seeders permiten poblar la base de datos con datos iniciales para desarrollo y pruebas.
Se encuentran en `src/identity/infrastructure/database/seeders/`.

### Estructura

- **TenantSeeder**: Crea tenants 'Rights Grid', 'Acme', 'Demo'.
- **UserSeeder**: Crea usuarios admin y regulares.
- **RoleSeeder**: Crea roles y asigna usuarios.

### Ejecución

```bash
# Ejecutar todos los seeders
docker compose exec rg-api deno run --allow-all scripts/seed.ts
```

### Datos Iniciales

| Tenant | Slug | Usuario | Password | Rol |
|--------|------|---------|----------|-----|
| Rights Grid | `rights-grid` | `admin@rights-grid.com` | `admin123` | admin |
| Acme Corp | `acme` | `admin@acme.com` | `admin123` | admin |
| Acme Corp | `acme` | `user@acme.com` | `user123` | user |
| Demo Company | `demo` | `user@demo.com` | `demo123` | user |

## Conexión

La conexión se gestiona en `src/shared/infrastructure/database/kysely.ts` y utiliza un pool de conexiones `pg`.
