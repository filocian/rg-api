# Security Module

El módulo de seguridad maneja hashing, tokens y encriptación.

## Password Service

Ubicación: `src/shared/infrastructure/security/password.service.ts`

### Hashing

Utiliza **bcrypt** para hashear contraseñas.

- **Configuración**: `BCRYPT_COST` (env var).
- **Hardening**: El servicio impone un **costo mínimo de 4** para evitar errores de librería y debilidad criptográfica. Si la variable de entorno es menor a 4, se fuerza a 4.

### Uso

```typescript
// Hash
const hash = await PasswordService.hash("mypassword");

// Verify
const isValid = await PasswordService.verify("mypassword", hash);
```

## Token Service

Ubicación: `src/identity/infrastructure/token-service.ts`

Maneja generación y validación de JWTs.
- Algoritmo: HS256 (default)
- Expiración:
    - Access Token: 15 min
    - Refresh Token: 7 días (rotación)
