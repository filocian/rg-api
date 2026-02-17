import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { appRouter } from './routes.ts';

export const app = new Hono();

app.use('*', logger());

app.route('/', appRouter);

app.onError((err, c) => {
    console.error(`${err}`);
    return c.json({
        ok: false,
        message: err.message,
        name: err.name,
    }, 500);
});
