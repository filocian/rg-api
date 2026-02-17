import { Hono } from 'hono';

export const appRouter = new Hono();

appRouter.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Mount module routers here
// example: appRouter.route('/sales', salesRouter);
