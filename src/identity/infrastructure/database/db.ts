import { db as sharedDb } from '../../../shared/infrastructure/database/kysely.ts';

import { Generated } from 'kysely';

// Defined types for the Identity module tables
export interface IdentityDatabase {
    tenants: {
        id: Generated<string>;
        slug: string;
        name: string | null;
        created_at: Generated<Date>;
        updated_at: Generated<Date>;
    };
    users: {
        id: Generated<string>;
        tenant_id: string;
        email: string;
        password_hash: string;
        token_version: Generated<number>;
        created_at: Generated<Date>;
        updated_at: Generated<Date>;
    };
    refresh_tokens: {
        id: Generated<string>;
        user_id: string;
        token_hash: string;
        expires_at: Date;
        created_at: Generated<Date>;
    };
    access_tokens: {
        id: string;
        user_id: string;
        created_at: Generated<Date>; // Defaults to now() ? Table definition in 002 migration might rely on default or explicit.
        expires_at: Date;
    };
    roles: {
        id: Generated<string>;
        tenant_id: string;
        name: string;
        parent_role_id: string | null;
        created_at: Generated<Date>;
    };
    permissions: {
        id: Generated<string>;
        scope: string; // e.g., 'tenants:read'
        description: string | null;
    };
    role_permissions: {
        role_id: string;
        permission_id: string;
    };
    user_roles: {
        user_id: string;
        role_id: string;
    };
}

// Re-export the db instance typed with Identity tables
// In a real application with multiple modules, we might want to intersect types
// or keep them separate. For this slice, we cast it.
export const db = sharedDb as unknown as import('kysely').Kysely<IdentityDatabase>;
