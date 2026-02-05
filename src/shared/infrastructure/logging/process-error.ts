
import { AppError } from "../errors/app-error.ts";
import { logger } from "./logger.ts";

export interface ProcessErrorHandlerConfig {
    /**
     * If true, prevents the process from exiting on unhandled rejection.
     * Use with caution. Default: false (Process will exit/crash).
     */
    preventExit?: boolean | ((error: AppError) => boolean);
}

export function registerProcessErrorHandlers(config: ProcessErrorHandlerConfig = {}) {
    
    // 1. Unhandled Promise Rejections
    globalThis.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
        // Normalize whatever reason (unknown, string, Error) into AppError
        const appError = AppError.normalize(e.reason);

        // Log strictly as UnHandled Fatal
        logger.fatal(
            appError.code || "UNHANDLED_REJECTION",
            "Unhandled Process Rejection",
            appError,
            undefined,
            "UnHandled"
        );

        // Determine exit behavior
        const shouldPreventExit = typeof config.preventExit === 'function' 
            ? config.preventExit(appError) 
            : !!config.preventExit;

        if (shouldPreventExit) {
            e.preventDefault(); // Deno won't exit
            console.warn(">> Process exit prevented by configuration.");
        }
        // Else: Deno will print error and exit (default behavior)
    });

    // 2. Uncaught Exceptions (less common in Deno than Node, but good measure)
    globalThis.addEventListener("error", (e: ErrorEvent) => {
        const appError = AppError.normalize(e.error || e.message);

        logger.fatal(
            appError.code || "UNCAUGHT_EXCEPTION",
            "Uncaught Process Exception",
            appError,
            undefined,
            "UnHandled"
        );
        
        // ErrorEvent in Deno works slightly differently regarding exit prevention vs Rejection
        // Usually unhandled 'error' event also causes exit.
        
        const shouldPreventExit = typeof config.preventExit === 'function' 
            ? config.preventExit(appError) 
            : !!config.preventExit;

        if (shouldPreventExit) {
            e.preventDefault();
        }
    });

    logger.info("SYSTEM_STARTUP", "Process Error Handlers Registered", undefined, "System");
}
