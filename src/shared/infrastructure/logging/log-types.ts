/**
 * Log Severity Levels
 */
export type LogSeverity = 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'custom';

import type { AppError } from '../errors/app-error.ts';

/**
 * Common Context shared across logs
 */
export interface LogContext {
    traceId?: string;
    tenantId?: string;
    [key: string]: unknown;
}

/**
 * Represents a serialized AppError structure within a log.
 */
export interface SerializedAppError {
    name: string;
    message: string;
    stack?: string;
    code: string;
    details?: unknown;
    severity?: LogSeverity;
    httpStatus?: number;
    isOperational?: boolean;
}

/**
 * Simplified Single Log Entry Interface
 */
/**
 * Strict Log Kinds
 */
export type LogKind = 'System' | 'CommandHandler' | 'QueryHandler' | 'Job' | 'Event' | 'Domain' | 'UnHandled';

/**
 * Simplified Single Log Entry Interface
 */
export interface LogEntry<T = unknown> {
    severity: LogSeverity;
    code: string;
    message: string;
    kind?: LogKind; // Now strict
    details?: T;
    error?: SerializedAppError;
    timestamp: string;
    traceId?: string;
    tenantId?: string;
    context?: Record<string, unknown>;
}

/**
 * Interface for Log Transports (Output strategies)
 */
export interface ILogTransport {
    log<T>(entry: LogEntry<T>): void | Promise<void>;
}

/**
 * Public Logger Contract
 */
export interface ILogger {
    // Generic methods
    info<T = unknown>(code: string, message: string, details?: T, kind?: LogKind, context?: LogContext): void;
    warn<T = unknown>(code: string, message: string, details?: T, kind?: LogKind, context?: LogContext): void;
    debug<T = unknown>(code: string, message: string, details?: T, kind?: LogKind, context?: LogContext): void;
    
    // Error handling
    error(error: AppError | any, context?: LogContext): void; // "any" allowed for now but implementation will be strict
    error<T = unknown>(code: string, message: string, error?: AppError, details?: T, kind?: LogKind, context?: LogContext): void;
    
    fatal<T = unknown>(code: string, message: string, error?: AppError, details?: T, kind?: LogKind, context?: LogContext): void;
}
