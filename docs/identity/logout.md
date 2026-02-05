# Logout Feature

Invalida la sesión actual del usuario.

## Estructura

```
src/identity/features/logout/
├── logout.command.ts
├── logout.handler.ts
└── post.logout.endpoint.ts
```

## Endpoint

```
POST /auth/logout
Authorization: Bearer <accessToken>
```

## Response

### Success (200)
```json
{
  "success": true,
  "data": { "message": "Session revoked" },
  "meta": { "timestamp": "..." }
}
```

## Flujo

1. Extraer session ID del JWT (claim `jti`)
2. Eliminar access token de la BD
3. Retornar confirmación

## Notas

- No elimina el refresh token (el usuario puede refrescar en otro dispositivo)
- Para logout completo, usar `/auth/revoke-access`

## Tests

`src/identity/features/logout/logout.handler.test.ts`

Escenarios cubiertos:
- ✅ Revocación exitosa (elimina access token de BD)
