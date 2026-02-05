import { Context } from 'hono';
import { successResponse } from '../../../shared/infrastructure/api/envelope.ts';
import { AppVariables } from '../../../shared/infrastructure/middleware/context.middleware.ts';

export const getKvDemoHandler = async (context: Context<{ Variables: AppVariables }>) => {
    const kvPath = Deno.env.get("DENO_KV_PATH");
    const keyValueStore = await Deno.openKv(kvPath);
    
    await keyValueStore.set(["demo"], "it works");
    const result = await keyValueStore.get(["demo"]);
    
    return context.json(successResponse({ result: result.value }));
};
