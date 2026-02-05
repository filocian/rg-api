import { StatusCode } from "hono/utils/http-status";

/**
 * Extended Error Codes.
 * We can keep strict strings or allow generic strings if the app grows too fast.
 * For robustness, we stick to specific codes but expand the list.
 */
export type AppErrorCode = 
    // Generic
    | "INTERNAL_ERROR"
    | "VALIDATION_ERROR"
    | "BAD_REQUEST"
    // Domain
    | "RESOURCE_NOT_FOUND"
    | "OPERATION_FAILED"
    | "CONFLICT"
    // Infra
    | "DB_CONNECTION_ERROR"
    | "FILE_SYSTEM_ERROR"
    | "SERVICE_UNAVAILABLE"
    // Security
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "TOO_MANY_REQUESTS";

/**
 * Mapping of ErrorCodes to default HTTP Status Codes.
 * Used as a fallback or default when no explicit status is provided.
 */
export const ErrorCodeMap: Record<string, StatusCode> = {
    "VALIDATION_ERROR": 422,
    "BAD_REQUEST": 400,
    "UNAUTHORIZED": 401,
    "FORBIDDEN": 403,
    "RESOURCE_NOT_FOUND": 404,
    "NOT_FOUND": 404, // Alias
    "CONFLICT": 409,
    "INTERNAL_ERROR": 500,
    "INTERNAL_SERVER_ERROR": 500, // Alias
    "SERVICE_UNAVAILABLE": 503,
    "TOO_MANY_REQUESTS": 429,
    "DB_CONNECTION_ERROR": 500,
    "FILE_SYSTEM_ERROR": 500,
    "OPERATION_FAILED": 500
};
