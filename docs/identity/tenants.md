# Tenant Features

CRUD de tenants (organizaciones/empresas).

## Features

| Feature | Endpoint | Descripción |
|---------|----------|-------------|
| create-tenant | `POST /tenants` | Crear tenant |
| get-tenant | `GET /tenants/:tenantId` | Obtener tenant |
| update-tenant | `PATCH /tenants/:tenantId` | Actualizar tenant |
| delete-tenant | `DELETE /tenants/:tenantId` | Eliminar tenant |

## Estructura por Feature

```
src/identity/features/create-tenant/
├── create-tenant.command.ts
├── create-tenant.handler.ts
└── post.create-tenant.endpoint.ts
```

## Create Tenant

```
POST /tenants
Authorization: Bearer <accessToken>

{
  "name": "Acme Corp",
  "slug": "acme"
}
```

### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "tenant-uuid",
    "name": "Acme Corp",
    "slug": "acme"
  }
}
```

## Errors Comunes

| Código | HTTP | Causa |
|--------|------|-------|
| `CONFLICT` | 409 | Slug ya existe |
| `VALIDATION_ERROR` | 422 | Datos inválidos |
| `RESOURCE_NOT_FOUND` | 404 | Tenant no existe |

## Tests

`src/identity/features/create-tenant/create-tenant.handler.test.ts`

Escenarios cubiertos:
- ✅ Creación exitosa (retorna nuevo tenant)
- ✅ Conflicto de Slug (Error 409 mapeado desde error DB 23505)
- ✅ Otros errores de DB (rethrow como Error genérico o AppError)
