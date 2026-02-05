
import { AppError } from "../errors/app-error.ts";
import {
    type ILogger,
    type ILogTransport,
    type LogContext,
    type LogEntry,
    type LogKind,
    type LogSeverity
} from "./log-types.ts";
import { ConsoleTransport } from "./transports/console.transport.ts";
import { FileTransport } from "./transports/file.transport.ts";

export class Logger implements ILogger {
    private transports: ILogTransport[];

    constructor() {
        this.transports = [
            new ConsoleTransport(),
            new FileTransport()
        ];
    }

    // --- Private Helpers ---

    private createEntry<T>(
        severity: LogSeverity, 
        code: string, 
        message: string, 
        details?: T, 
        kind: LogKind = "Event",
        error?: AppError, 
        context?: LogContext
    ): LogEntry<T> {
        
        const timestamp = new Date().toISOString();
        const { traceId, tenantId, ...otherContext } = context || {};

        const entry: LogEntry<T> = {
            severity,
            code,
            message,
            kind, 
            details,
            timestamp,
            traceId,
            tenantId,
            context: Object.keys(otherContext).length > 0 ? otherContext : undefined,
        };

        if (error) {
            // Strict: We assume the error passes is already an AppError.
            // Normalization happens upstream (AppError.normalize).
            entry.error = error.toJSON();
        }

        return entry;
    }

    private dispatch<T>(entry: LogEntry<T>) {
        for (const transport of this.transports) {
            transport.log(entry);
            // Allow transport to handle async if needed, but we don't await here to avoid blocking
        }
    }

    private log<T>(
        severity: LogSeverity, 
        code: string, 
        message: string, 
        details?: T, 
        kind?: LogKind,
        error?: AppError, 
        context?: LogContext
    ) {
        // Default kind fallback
        const finalKind = kind || (error ? 'System' : 'Event'); 
        const entry = this.createEntry(severity, code, message, details, finalKind, error, context);
        this.dispatch(entry);
    }

    // --- Public ILogger Implementation ---

    info<T = unknown>(code: string, message: string, details?: T, kind?: LogKind, context?: LogContext): void {
        this.log<T>('info', code, message, details, kind, undefined, context);
    }

    warn<T = unknown>(code: string, message: string, details?: T, kind?: LogKind, context?: LogContext): void {
        this.log<T>('warn', code, message, details, kind, undefined, context);
    }

    debug<T = unknown>(code: string, message: string, details?: T, kind?: LogKind, context?: LogContext): void {
        this.log<T>('debug', code, message, details, kind, undefined, context);
    }

    error<T = unknown>(arg1: AppError | string, arg2?: LogContext | string, arg3?: AppError, arg4?: T, arg5?: LogKind, arg6?: LogContext): void {
        if (arg1 instanceof AppError) {
            const error = arg1;
            const context = arg2 as LogContext | undefined;
            // Extract from AppError
            const code = error.code;
            const details = error.details as T; // Best effort cast
            const severity = error.severity;
            
            // Kind defaults to 'System' or 'UnHandled' -> User should specify if they want specific kind via overloads
            // For now default to 'System' if purely error-driven
            this.log(severity, code, error.message, details, 'System', error, context);
        } else {
            // Signature: error(code, message, error?, details?, kind?, context?)
            // Enforce arg3 is AppError if provided
            const code = arg1 as string;
            const message = arg2 as string;
            const error = arg3;
            const details = arg4;
            const kind = arg5;
            const context = arg6;
            
            this.log<T>('error', code, message, details, kind || 'System', error, context);
        }
    }

    fatal<T = unknown>(code: string, message: string, error?: AppError, details?: T, kind?: LogKind, context?: LogContext): void {
         this.log<T>('fatal', code, message, details, kind || 'System', error, context);
    }
}

export const logger = new Logger();
