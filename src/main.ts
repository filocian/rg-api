import { app } from './http.ts';
import { config } from './config.ts';

Deno.serve({ port: config.port }, app.fetch);
