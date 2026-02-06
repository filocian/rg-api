# Role Features

Role management for RBAC.

## Features

| Feature | Endpoint | Description |
| :--- | :--- | :--- |
| create-role | `POST /roles` | Create role |
| update-role | `PATCH /roles/:roleId` | Update role |
| delete-role | `DELETE /roles/:roleId` | Delete role |

## Structure

```txt
src/identity/features/create-role/
├── create-role.command.ts
├── create-role.handler.ts
└── post.create-role.endpoint.ts
```

## Create Role

```txt
POST /roles
Authorization: Bearer <accessToken>
```

```json
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

## Role Hierarchy

Roles support inheritance via `parentRoleId`. A child role inherits permissions from the parent.

## Errors

| Code | HTTP | Cause |
| :--- | :--- | :--- |
| `CONFLICT` | 409 | Name already exists in tenant |
| `FORBIDDEN` | 403 | No permissions to create roles |
