import { Context } from "hono";
import { AppError } from "../errors/app-error.ts";
import { logger } from "../logging/logger.ts";
import { AppVariables } from "../middleware/context.middleware.ts";
import { errorResponse } from "./envelope.ts";

export const globalErrorHandler = (error: Error, context: Context<{ Variables: AppVariables }>) => {
    const traceId = context.get('traceId');
    const tenantId = context.get('tenantId');

    // 1. Normalize whatever error (Error, unknown, etc.) into Strict AppError
    const appError = AppError.normalize(error);

    // 2. Automate Logging: "Best Moment"
    // We log the *normalized* AppError so the Logger respects its severity
    // Kind defaults to 'System' for API errors, or we could inspect
    logger.error(appError, { traceId, tenantId });

    context.status(appError.httpStatus as any);
    return context.json(errorResponse(appError, traceId));
}
