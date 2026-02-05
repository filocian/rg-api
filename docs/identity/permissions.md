# Permission Features

Gestión de permisos para roles.

## Features

| Feature | Endpoint | Descripción |
|---------|----------|-------------|
| add-permission | `POST /roles/:roleId/permissions` | Agregar permiso a rol |
| remove-permission | `DELETE /roles/:roleId/permissions/:permissionId` | Quitar permiso |
| get-permissions | `GET /permissions` | Listar permisos disponibles |

## Add Permission

```
POST /roles/:roleId/permissions
Authorization: Bearer <accessToken>

{
  "permissionId": "perm-uuid"
}
```

## Get Permissions

```
GET /permissions
Authorization: Bearer <accessToken>
```

### Response
```json
{
  "success": true,
  "data": [
    { "id": "...", "name": "users:read", "description": "..." },
    { "id": "...", "name": "users:write", "description": "..." }
  ]
}
```

## Formato de Permisos

Los permisos usan formato `resource:action`:
- `users:read`, `users:write`
- `tenants:manage`
- `roles:assign`
