# System Module

System utilities and diagnostic endpoints.

## Diagnostics

**Endpoint:** `GET /`

Basic health check to verify API is running.

```txt
GET /
```

### Response (200 OK)

```json
{
  "success": true,
  "data": "Hello from rg-api (Hono on Deno!)"
}
```

## KV Demo

**Endpoint:** `GET /kv-demo`

Demonstrates Deno KV functionality (for testing/debug purposes).

```txt
GET /kv-demo
```

### Response (200 OK)

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

## Structure

```txt
src/system/
├── system.routes.ts
└── features/
    ├── diagnostics/
    │   └── get.diagnostics.endpoint.ts
    └── kv-demo/
        └── get.kv-demo.endpoint.ts
```
