import { StatusCode } from "hono/utils/http-status";
import { LogSeverity } from "../logging/log-types.ts";
import { AppErrorCode, ErrorCodeMap } from "./error-codes.ts";

export interface AppErrorConfig<TDetails = unknown> {
    severity?: LogSeverity; 
    details?: TDetails; 
    httpStatus?: StatusCode;
    isOperational?: boolean;
}

/**
 * Universal Application Error.
 * Used across Domain, Application, and Infrastructure layers.
 */
export class AppError<TDetails = unknown> extends Error {
    public readonly code: string; 
    public readonly severity: LogSeverity;
    public readonly details?: TDetails;
    public readonly httpStatus?: StatusCode; 
    public readonly isOperational: boolean; 

    private constructor(
        code: string, 
        message: string, 
        config: AppErrorConfig<TDetails> = {}
    ) {
        super(message);
        this.code = code;
        this.severity = config.severity || 'error';
        this.details = config.details;
        this.httpStatus = config.httpStatus || ErrorCodeMap[code];
        this.isOperational = config.isOperational ?? true;
        
        this.name = "AppError";
        // Fix prototype chain
        Object.setPrototypeOf(this, AppError.prototype);
    }

    /**
     * Factory method to create an AppError.
     */
    public static from<T = unknown>(code: AppErrorCode | string, message: string, config?: AppErrorConfig<T>): AppError<T> {
        return new AppError<T>(code, message, config);
    }

    /**
     * Specialized factory for Validation Errors
     */
    public static validation<T = unknown>(details: T, message = "Validation Failed"): AppError<T> {
        return new AppError("VALIDATION_ERROR", message, {
            severity: 'warn',
            httpStatus: 422,
            details,
            isOperational: true
        });
    }

    /**
     * Specialized factory for Not Found Errors
     */
    public static notFound(message = "Resource not found"): AppError {
        return new AppError("RESOURCE_NOT_FOUND", message, {
            severity: 'warn', // Usually a warning, not a system error
            httpStatus: 404,
            isOperational: true
        });
    }

    /**
     * Specialized factory for Fatal/System Errors
     */
    public static fatal(message: string, error?: Error): AppError {
        return new AppError("INTERNAL_ERROR", message, {
            severity: 'fatal',
            httpStatus: 500,
            details: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
            isOperational: false // System crash/bug, possibly not recoverable
        });
    }

    /**
     * Normalizes any error value into an AppError.
     * Guaranteed to return an AppError instance.
     */
    public static normalize(error: unknown): AppError {
        if (error instanceof AppError) {
            return error;
        }

        if (error instanceof Error) {
            // Check if it's a known HTTP error or library error we want to unwrap?
            // For now, treat raw Errors as system errors (Fatal/Internal)
            // unless we parse them logic specific.
            return AppError.fatal(error.message, error);
        }

        // Handle strings, objects, etc.
        const message = typeof error === 'string' ? error : "Unknown error occurred";
        return AppError.fatal(message, undefined);
    }

    public toJSON() {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack,
            code: this.code,
            severity: this.severity, // Note: SerializedAppError might not have severity in log-types, check interface
            details: this.details,
            httpStatus: this.httpStatus,
            isOperational: this.isOperational
        };
    }
}
