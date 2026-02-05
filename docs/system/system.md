# System Module

Endpoints de sistema y utilidades.

## Diagnostics

**Endpoint:** `GET /`

Health check básico.

```
GET /
```

### Response
```json
{
  "success": true,
  "data": "Hello from rg-api (Hono on Deno!)"
}
```

## KV Demo

**Endpoint:** `GET /kv-demo`

Demostración de Deno KV.

```
GET /kv-demo
```

### Response
```json
{
  "success": true,
  "data": {
    "message": "KV demo",
    "key": "...",
    "value": "..."
  }
}
```

## Estructura

```
src/system/
├── system.routes.ts
└── features/
    ├── diagnostics/
    │   └── get.diagnostics.endpoint.ts
    └── kv-demo/
        └── get.kv-demo.endpoint.ts
```
