# Diagnostics Feature

## Description

Provides system health and diagnostic information, including readiness and liveness checks.

## Folder Structure

Located in `src/system/features/diagnostics`.

## File Structure

- `diagnostics.endpoint.ts`: Hono handlers for diagnostic routes.

## API Responses

Returns standard `ApiSuccessResponse` with:

- `status`: "ok"
- `uptime`: System uptime in seconds
- `version`: Current API version

## Constants

- `VERSION`: "1.0.0"

## Logging

Logs `HEALTH_CHECK` events on access.
