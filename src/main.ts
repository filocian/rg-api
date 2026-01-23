import { Hono, type Context } from 'npm:hono';

const app = new Hono();

app.get('/', (c: Context) => {
    return c.text('Hello from rg-api (Hono on Deno!)');
});

// KV Example (Local Simulation)
app.get('/kv-demo', async (c: Context) => {
    const kvPath = Deno.env.get("DENO_KV_PATH");
    const kv = await Deno.openKv(kvPath);
    await kv.set(["demo"], "it works");
    const res = await kv.get(["demo"]);
    return c.json({ result: res.value });
});

Deno.serve(app.fetch);
