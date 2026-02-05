# Revoke Access Feature

Revoca todos los tokens de un usuario (logout global).

## Estructura

```
src/identity/features/revoke-access/
├── revoke-access.command.ts
├── revoke-access.handler.ts
└── post.revoke-access.endpoint.ts
```

## Endpoint

```
POST /auth/revoke
Authorization: Bearer <accessToken>

{
  "userId": "user-uuid"  // opcional, default: current user
}
```

## Response

### Success (200)
```json
{
  "success": true,
  "data": { "message": "All sessions revoked" },
  "meta": { "timestamp": "..." }
}
```

## Flujo

1. Incrementar `token_version` del usuario
2. Eliminar todos los refresh tokens del usuario
3. Todos los JWTs existentes quedan inválidos (version mismatch)

## Casos de Uso

- Usuario cambia password
- Admin revoca acceso de un usuario
- Usuario detecta acceso no autorizado

## Tests

`src/identity/features/revoke-access/revoke-access.handler.test.ts`

Escenarios cubiertos:
- ✅ Revocación Global (incrementa token_version, borra todos los refresh tokens)
- ✅ Revocación Específica (borra token específico + incrementa versión)
