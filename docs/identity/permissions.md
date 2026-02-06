# Permission Features

Permission management for roles.

## Features

| Feature | Endpoint | Description |
| :--- | :--- | :--- |
| add-permission | `POST /roles/:roleId/permissions` | Add permission to role |
| remove-permission | `DELETE /roles/:roleId/permissions/:permissionId` | Remove permission |
| get-permissions | `GET /permissions` | List available permissions |

## Add Permission

```txt
POST /roles/:roleId/permissions
Authorization: Bearer <accessToken>
```

```json
{
  "permissionId": "perm-uuid"
}
```

## Get Permissions

```txt
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

## Permission Format

Permissions use `resource:action` format:

- `users:read`, `users:write`
- `tenants:manage`
- `roles:assign`
