# Database Module

The database module uses **PostgreSQL** with **Kysely** as the query builder.

## Migrations

Migrations are located in `src/identity/infrastructure/database/migrations`.

### Versioning

- **v1.0 (Unified)**: `v1.0_init_identity.ts`
  - Contains the full initial structure for Identity (Tenants, Users, Roles, Permissions, Tokens).
  - Replaces legacy migrations (`001`, `002`, `003`).

### Running Migrations

Execute migrations from the host (via Docker):

```bash
docker compose exec rg-api deno run --allow-all scripts/migrate.ts
```

## Seeders

Seeders populate the database with initial data for development and testing. Located in `src/identity/infrastructure/database/seeders/`.

### Structure

- **TenantSeeder**: Creates tenants 'Rights Grid', 'Acme', 'Demo'.
- **UserSeeder**: Creates admin and regular users.
- **RoleSeeder**: Creates roles and assigns users.

### Running Seeders

To run all seeders:

```bash
docker compose exec rg-api deno run --allow-all scripts/seed.ts
```

### Initial Data

| Tenant | Slug | User | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| Rights Grid | `rights-grid` | `admin@rights-grid.com` | `admin123` | admin |
| Acme Corp | `acme` | `admin@acme.com` | `admin123` | admin |
| Acme Corp | `acme` | `user@acme.com` | `user123` | user |
| Demo Company | `demo` | `user@demo.com` | `demo123` | user |

## Connection

Connection logic is managed in `src/shared/infrastructure/database/kysely.ts` using a `pg` connection pool.
