import { assertEquals } from '@std/assert';
import { app } from './http.ts';

Deno.test('Health check returns 200', async () => {
    const res = await app.request('/health');
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.status, 'ok');
});
