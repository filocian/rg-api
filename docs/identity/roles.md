# Role Features

Gestión de roles para RBAC.

## Features

| Feature | Endpoint | Descripción |
|---------|----------|-------------|
| create-role | `POST /roles` | Crear rol |
| update-role | `PATCH /roles/:roleId` | Actualizar rol |
| delete-role | `DELETE /roles/:roleId` | Eliminar rol |

## Estructura

```
src/identity/features/create-role/
├── create-role.command.ts
├── create-role.handler.ts
└── post.create-role.endpoint.ts
```

## Create Role

```
POST /roles
Authorization: Bearer <accessToken>

{
  "name": "admin",
  "parentRoleId": null
}
```

### Response (201)
```json
{
  "success": true,
  "data": {
    "id": "role-uuid",
    "name": "admin",
    "tenant_id": "...",
    "parent_role_id": null
  }
}
```

## Jerarquía de Roles

Los roles soportan herencia mediante `parentRoleId`. Un rol hijo hereda los permisos del padre.

## Errors

| Código | HTTP | Causa |
|--------|------|-------|
| `CONFLICT` | 409 | Nombre ya existe en tenant |
| `FORBIDDEN` | 403 | Sin permisos para crear roles |
