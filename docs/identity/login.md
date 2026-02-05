# Login Feature

Autenticación de usuarios mediante email/password.

## Estructura

```
src/identity/features/login/
├── login.command.ts       # Command DTO
├── login.handler.ts       # Lógica principal
└── post.login.endpoint.ts # HTTP endpoint
```

## Endpoint

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123",
  "slug": "acme"
}
```

## Response

### Success (200)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "uuid-refresh-token"
  },
  "meta": { "timestamp": "..." }
}
```

### Errors
| Código | HTTP | Causa |
|--------|------|-------|
| `UNAUTHORIZED` | 401 | Credenciales inválidas |
| `INTERNAL_ERROR` | 500 | Región no encontrada |

## Flujo

1. Resolver tenant por slug
2. Resolver región del tenant → crear `TenantContext`
3. Buscar usuario por email EN LA REGIÓN CORRECTA
4. Verificar password con bcrypt
5. Crear refresh token (7 días) + access token JWT (15 min)
6. Retornar tokens

## Multi-Región

Este feature demuestra el patrón completo:
- Usa `TenantRegionResolver` para determinar región
- Crea `TenantContext` para operaciones de BD
- Todos los queries se ejecutan en la BD regional correcta

## Tests

`src/identity/features/login/login.handler.test.ts`

Escenarios cubiertos:
- ✅ Login exitoso (retorna access + refresh tokens)
- ✅ Tenant no encontrado (Error 401 seguro)
- ✅ Región no encontrada (Error 500)
- ✅ Usuario no encontrado (Error 401 seguro)
- ✅ Password incorrecto (Error 401 seguro)
