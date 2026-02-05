import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { errorResponse } from './shared/infrastructure/api/envelope.ts';
import { globalErrorHandler } from './shared/infrastructure/api/global-error.ts';
import { AppError } from './shared/infrastructure/errors/app-error.ts';
import { logger } from './shared/infrastructure/logging/logger.ts';
import { registerProcessErrorHandlers } from "./shared/infrastructure/logging/process-error.ts";
import { AppVariables, contextMiddleware } from './shared/infrastructure/middleware/context.middleware.ts';
import { loggerMiddleware } from './shared/infrastructure/middleware/logger.middleware.ts';
import { systemRoutes } from './system/system.routes.ts';

// 0. Register Process Error Handlers (Catch unhandled rejections/exceptions)
registerProcessErrorHandlers({ 
    preventExit: false // Default: let Deno crash after logging, or set true to keep alive
});

// Initialize Hono App with strict typing for Context Variables
const app = new Hono<{ Variables: AppVariables }>();

import { regionMiddleware } from './shared/infrastructure/middleware/region.middleware.ts';

// 1. Global Middleware
app.use('*', contextMiddleware); // 1. Setup Context (TraceId, TenantId)
app.use('*', regionMiddleware);  // 2. Setup Region Context (TenantContext -> Region DB)
app.use('*', loggerMiddleware);  // 3. Log Request
app.use('*', secureHeaders());   // 3. Security Headers
app.use('*', cors());            // 4. CORS (Defaults to allow all)

// 2. Global Error Handling
app.onError(globalErrorHandler);

app.notFound((context) => {
    // Standardize 404 responses
    const error = AppError.from("NOT_FOUND", "The requested resource does not exist.");
    const traceId = context.get('traceId');
    
    context.status(404);
    return context.json(errorResponse(error, traceId));
});

// 3. Routes
import { identityRoutes } from './identity/identity.module.ts';
app.route('/', systemRoutes);
app.route('/identity', identityRoutes);

// 4. Start Server
logger.info("SERVER_START", "Starting rg-api server...");
Deno.serve({ port: 8000 }, app.fetch);
