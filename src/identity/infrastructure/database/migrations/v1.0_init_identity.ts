import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    // --- 1. Tenants ---
    await db.schema.createTable('tenants')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('slug', 'varchar', (col) => col.notNull().unique())
        .addColumn('name', 'varchar')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute();

    // --- 2. Users ---
    await db.schema.createTable('users')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('tenant_id', 'uuid', (col) => col.notNull().references('tenants.id').onDelete('cascade'))
        .addColumn('email', 'varchar', (col) => col.notNull())
        .addColumn('password_hash', 'varchar', (col) => col.notNull())
        .addColumn('token_version', 'integer', (col) => col.defaultTo(1).notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .addUniqueConstraint('users_email_tenant_unique', ['email', 'tenant_id'])
        .execute();

    // RLS for Users
    await sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY`.execute(db);
    await sql`
        CREATE POLICY tenant_isolation_policy ON users
        USING (tenant_id::text = current_setting('app.current_tenant', true))
        WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true))
    `.execute(db);

    // --- 3. Refresh Tokens ---
    await db.schema.createTable('refresh_tokens')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('token_hash', 'varchar', (col) => col.notNull())
        .addColumn('expires_at', 'timestamp', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute();

    // --- 4. Access Tokens (Sessions) ---
    await db.schema.createTable('access_tokens')
        .addColumn('id', 'uuid', (col) => col.primaryKey()) // JTI
        .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('expires_at', 'timestamp', (col) => col.notNull())
        .execute();

    // --- 5. Roles ---
    await db.schema.createTable('roles')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('tenant_id', 'uuid', (col) => col.notNull().references('tenants.id').onDelete('cascade'))
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('parent_role_id', 'uuid', (col) => col.references('roles.id').onDelete('set null'))
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .addUniqueConstraint('roles_name_tenant_unique', ['name', 'tenant_id'])
        .execute();

    // RLS for Roles
    await sql`ALTER TABLE roles ENABLE ROW LEVEL SECURITY`.execute(db);
    await sql`
        CREATE POLICY tenant_isolation_policy ON roles
        USING (tenant_id::text = current_setting('app.current_tenant', true))
        WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true))
    `.execute(db);

    // --- 6. Permissions ---
    await db.schema.createTable('permissions')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn('scope', 'varchar', (col) => col.notNull().unique())
        .addColumn('description', 'varchar')
        .execute();

    // --- 7. Relationships ---
    
    // Role <-> Permissions
    await db.schema.createTable('role_permissions')
        .addColumn('role_id', 'uuid', (col) => col.notNull().references('roles.id').onDelete('cascade'))
        .addColumn('permission_id', 'uuid', (col) => col.notNull().references('permissions.id').onDelete('cascade'))
        .addPrimaryKeyConstraint('role_permissions_pk', ['role_id', 'permission_id'])
        .execute();

    // User <-> Roles
    await db.schema.createTable('user_roles')
        .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('role_id', 'uuid', (col) => col.notNull().references('roles.id').onDelete('cascade'))
        .addPrimaryKeyConstraint('user_roles_pk', ['user_id', 'role_id'])
        .execute();

    // --- 8. Functions ---
    
    // get_effective_permissions
    await sql`
        CREATE OR REPLACE FUNCTION get_effective_permissions(user_uuid uuid)
        RETURNS TABLE (scope varchar) AS $$
        BEGIN
            RETURN QUERY
            WITH RECURSIVE user_role_hierarchy AS (
                -- 1. Direct Roles
                SELECT r.id, r.parent_role_id
                FROM roles r
                JOIN user_roles ur ON ur.role_id = r.id
                WHERE ur.user_id = user_uuid
                
                UNION ALL
                
                -- 2. Parent Roles (Inheritance)
                SELECT p.id, p.parent_role_id
                FROM roles p
                JOIN user_role_hierarchy c ON c.parent_role_id = p.id
            )
            SELECT DISTINCT p.scope
            FROM permissions p
            JOIN role_permissions rp ON rp.permission_id = p.id
            JOIN user_role_hierarchy rh ON rh.id = rp.role_id;
        END;
        $$ LANGUAGE plpgsql;
    `.execute(db);

    // --- 9. Initial Structural Data (Standard Permissions) ---
    const permissions = [
        // Tenancy
        { scope: 'identity.tenants.read', description: 'View tenant details' },
        { scope: 'identity.tenants.write', description: 'Create or update tenants' },
        { scope: 'identity.tenants.delete', description: 'Delete tenants' },
        
        // Users
        { scope: 'identity.users.read', description: 'View users' },
        { scope: 'identity.users.write', description: 'Create or update users' },
        { scope: 'identity.users.delete', description: 'Hard delete users' },
        { scope: 'identity.users.softdelete', description: 'Deactivate users' },
        
        // Roles
        { scope: 'identity.roles.read', description: 'View roles' },
        { scope: 'identity.roles.write', description: 'Create or update roles' },
        { scope: 'identity.roles.delete', description: 'Delete roles' },
        
        // Permissions Management
        { scope: 'identity.roles.permissions.manage', description: 'Assign permissions to roles' }
    ];

    await db.insertInto('permissions')
        .values(permissions)
        .onConflict((oc) => oc.column('scope').doNothing())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await sql`DROP FUNCTION IF EXISTS get_effective_permissions(uuid)`.execute(db);
    await db.schema.dropTable('user_roles').execute();
    await db.schema.dropTable('role_permissions').execute();
    await db.schema.dropTable('permissions').execute();
    await db.schema.dropTable('roles').execute();
    await db.schema.dropTable('access_tokens').execute();
    await db.schema.dropTable('refresh_tokens').execute();
    await db.schema.dropTable('users').execute();
    await db.schema.dropTable('tenants').execute();
}
