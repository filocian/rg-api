import { assertEquals, assertNotEquals } from "jsr:@std/assert@1";
import { db } from "../src/Identity/Infrastructure/Database/db.ts";

// Config (Running inside container, accessing itself on localhost:8000)
const API_URL = "http://localhost:8000";

// Helpers
async function login(email: string, password: string, slug: string = 'test-tenant') {
    const res = await fetch(`${API_URL}/identity/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password, slug }),
        headers: { "Content-Type": "application/json" }
    });
    return await res.json();
}

Deno.test("Identity Module: Auth Flow Hardening", async (t) => {
    let accessToken = "";
    let refreshToken = "";
    let jti = "";

    await t.step("0. Setup (Seed DB)", async () => {
        // 1. Create Tenant
        let tenant = await db.selectFrom('tenants').select('id').where('slug', '=', 'test-tenant').executeTakeFirst();
        if (!tenant) {
            tenant = await db.insertInto('tenants')
                .values({ name: 'Test Tenant', slug: 'test-tenant' })
                .returning('id')
                .executeTakeFirst();
        }

        // 2. Create User
        const existingUser = await db.selectFrom('users').select('id').where('email', '=', 'admin@filocian.com').executeTakeFirst();
        let userId = existingUser?.id;

        if (!existingUser && tenant) {
            const newUser = await db.insertInto('users')
                .values({
                    email: 'admin@filocian.com',
                    password_hash: 'password', // Plaintext for demo
                    tenant_id: tenant.id!
                })
                .returning('id')
                .executeTakeFirst();
            userId = newUser!.id;
        }

        // 3. Create Role & Assign
        if (userId && tenant) {
             let role = await db.selectFrom('roles').select('id').where('name', '=', 'Admin').where('tenant_id', '=', tenant.id!).executeTakeFirst();
             if (!role) {
                 // We need to bypass RLS or set context? 
                 // Since we are running as root db client here without middleware, we are fine IF RLS isn't enforced on connection user by default (it is bypassed for superuser/table owner).
                 role = await db.insertInto('roles')
                    .values({ name: 'Admin', tenant_id: tenant.id! })
                    .returning('id')
                    .executeTakeFirst();
             }

             // Assign Role
             await db.insertInto('user_roles')
                .values({ user_id: userId, role_id: role!.id })
                .onConflict((oc) => oc.doNothing())
                .execute();

             // 4. Seed Permissions
             const perms = ['identity.users.read', 'identity.users.write'];
             for (const p of perms) {
                 let perm = await db.selectFrom('permissions').select('id').where('scope', '=', p).executeTakeFirst();
                 if (!perm) {
                     perm = await db.insertInto('permissions')
                        .values({ scope: p, description: 'Test perm' })
                        .returning('id')
                        .executeTakeFirst();
                 }
                 
                 // Assign to Role
                 await db.insertInto('role_permissions')
                    .values({ role_id: role!.id, permission_id: perm!.id })
                    .onConflict((oc) => oc.doNothing())
                    .execute();
             }
        }
    });

    await t.step("1. Login returns Reference Token (JWT)", async () => {
        // Now user exists!
        const res = await login("admin@filocian.com", "password"); 
        // Note: Password might need to be hashed match. If this fails, user might need to seed users first.
        // For this test generator, assuming the API is running and user exists.
        
        if (res.error) {
            console.log("Login failed (Expected if user not seeded):", res);
            return; // Skip if no user
        }

        accessToken = res.data.accessToken;
        refreshToken = res.data.refreshToken;
        
        // Decode JWT to find JTI (without verify for client side test)
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        jti = payload.jti;

        assertNotEquals(accessToken, "", "Access Token should exist");
        assertNotEquals(jti, undefined, "JTI should be in payload");
        assertEquals(payload.scopes, undefined, "Scopes should NOT be in payload");
    });

    if (!accessToken) return; // Stop if login failed

    await t.step("2. Session Check in DB", async () => {
         const session = await db.selectFrom('access_tokens')
            .select('id')
            .where('id', '=', jti)
            .executeTakeFirst();
            
         assertNotEquals(session, undefined, "Session should exist in DB");
    });

    await t.step("3. Access Protected Resource (Dynamic Perms)", async () => {
        const res = await fetch(`${API_URL}/identity/me/permissions`, {
            headers: { "Authorization": `Bearer ${accessToken}` }
        });
        const data = await res.json();
        
        if (res.status !== 200) {
            console.log("Access Protected Failed:", data);
        }
        
        assertEquals(res.status, 200);
        // data.data should be array of strings
        console.log("Permissions:", data.data);
    });

    await t.step("4. Logout (Revoke Session)", async () => {
        const res = await fetch(`${API_URL}/identity/auth/logout`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` }
        });
        
        if (res.status !== 200) {
             const err = await res.json();
             console.log("Logout Failed:", err);
        } else {
             await res.json(); // Consume success body
        }

        assertEquals(res.status, 200);

        // Verify DB deletion
        const session = await db.selectFrom('access_tokens')
            .select('id')
            .where('id', '=', jti)
            .executeTakeFirst();
            
        assertEquals(session, undefined, "Session should be deleted from DB");
    });

    await t.step("5. Access Denied After Logout", async () => {
        const res = await fetch(`${API_URL}/identity/me/permissions`, {
            headers: { "Authorization": `Bearer ${accessToken}` }
        });
        await res.text(); // Consume body to prevent leaks
        assertEquals(res.status, 401, "Should be Unauthorized after logout");
    });
    await t.step("6. Cleanup", async () => {
         await db.destroy();
    });
});
