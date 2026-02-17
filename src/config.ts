import { load } from '@std/dotenv';

await load({ export: true });

export const config = {
    env: Deno.env.get('DENO_ENV') || 'development',
    port: parseInt(Deno.env.get('PORT') || '8000'),
    logLevel: Deno.env.get('LOG_LEVEL') || 'info',
};
