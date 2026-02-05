
import { Context, Next } from "hono";
import { logger } from "../logging/logger.ts";
import { AppVariables } from "./context.middleware.ts";

export const loggerMiddleware = async (context: Context<{ Variables: AppVariables }>, next: Next) => {
    const start = Date.now();
    const { method, url } = context.req;
    const traceId = context.get('traceId');

    // Log Request
    logger.info("HTTP_REQUEST", `Incoming Request: ${method} ${url}`, { traceId, method, url });

    await next();

    const end = Date.now();
    const status = context.res.status;
    const durationMs = end - start;

    // Log Response
    logger.info("HTTP_RESPONSE", `Request Completed: ${method} ${url}`, { 
        traceId, 
        status, 
        durationMs,
        method,
        url
    });
};
