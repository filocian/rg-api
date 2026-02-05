import { AppError } from "../errors/app-error.ts";

export interface ApiMetadata {
    timestamp: string;
    [key: string]: any;
}

export interface ApiErrorDetail {
    code: string;
    message: string;
    traceId?: string;
    details?: any;
}

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    meta: ApiMetadata;
}

export interface ApiErrorResponse {
    success: false;
    error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Creates a success response envelope.
 */
export function successResponse<T>(data: T, meta?: any): ApiSuccessResponse<T> {
    return {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta,
        },
    };
}

/**
 * Creates an error response envelope.
 */
export function errorResponse(error: AppError, traceId?: string): ApiErrorResponse {
    // In production, we might want to hide details for 500 errors
    // distinct from 4xx errors if strict security is required.
    // For now, we pass details through.

    return {
        success: false,
        error: {
            code: error.code,
            message: error.message,
            traceId: traceId,
            details: error.details
        }
    };
}
