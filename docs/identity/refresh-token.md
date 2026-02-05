# Refresh Token Feature

Renueva el access token usando un refresh token válido.

## Estructura

```
src/identity/features/refresh-token/
├── refresh-token.command.ts
├── refresh-token.handler.ts
└── post.refresh-token.endpoint.ts
```

## Endpoint

```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "uuid-refresh-token"
}
```

## Response

### Success (200)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci..."
  },
  "meta": { "timestamp": "..." }
}
```

### Errors
| Código | HTTP | Causa |
|--------|------|-------|
| `UNAUTHORIZED` | 401 | Refresh token inválido/expirado |
| `FORBIDDEN` | 403 | Token version mismatch (usuario revocado) |

## Flujo

1. Hashear refresh token recibido
2. Buscar hash en BD
3. Validar expiración
4. Verificar token version del usuario
5. Generar nuevo access token
6. Retornar access token

## Tests

`src/identity/features/refresh-token/refresh-token.handler.test.ts`

Escenarios cubiertos:
- ✅ Rotación exitosa (invalida anterior, crea nuevos access+refresh)
- ✅ Token inválido/expirado (Error)
- ✅ Usuario no encontrado (Error)
