import { Hono } from 'hono';
import { AppVariables } from '../shared/infrastructure/middleware/context.middleware.ts';
import { getDiagnosticsHandler } from './features/diagnostics/get.diagnostics.endpoint.ts';
import { getKvDemoHandler } from './features/kv-demo/get.kv-demo.endpoint.ts';

const systemRoutes = new Hono<{ Variables: AppVariables }>();

systemRoutes.get('/', getDiagnosticsHandler);
systemRoutes.get('/kv-demo', getKvDemoHandler);

export { systemRoutes };
