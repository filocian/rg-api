import { Context } from 'hono';
import { logger } from '../../../shared/infrastructure/logging/logger.ts';
import { AppVariables } from '../../../shared/infrastructure/middleware/context.middleware.ts';

export const getDiagnosticsHandler = (context: Context<{ Variables: AppVariables }>) => {
    const traceId = context.get('traceId');
    logger.info("DIAGNOSTICS", "Welcome endpoint accessed", { traceId });
    return context.text('Hello from rg-api (Hono on Deno!)');
};
