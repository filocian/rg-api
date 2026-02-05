import { Kysely } from 'kysely';
import { ISeeder } from './seeder.interface.ts';

interface RoleSeed {
    name: string;
    tenantSlug: string;
    parentRoleName?: string;
}

interface UserRoleSeed {
    userEmail: string;
    roleName: string;
    tenantSlug: string;
}

const ROLES: RoleSeed[] = [
    { name: 'admin', tenantSlug: 'rights-grid' },
    { name: 'admin', tenantSlug: 'acme' },
    { name: 'user', tenantSlug: 'acme' },
    { name: 'user', tenantSlug: 'demo' },
];

const USER_ROLES: UserRoleSeed[] = [
    { userEmail: 'admin@rights-grid.com', roleName: 'admin', tenantSlug: 'rights-grid' },
    { userEmail: 'admin@acme.com', roleName: 'admin', tenantSlug: 'acme' },
    { userEmail: 'user@demo.com', roleName: 'user', tenantSlug: 'demo' },
];

export const RoleSeeder: ISeeder = {
    name: 'RoleSeeder',
    
    async run(db: Kysely<any>): Promise<void> {
        console.log('  → Seeding roles...');
        
        // Seed roles
        for (const role of ROLES) {
            const tenant = await db.selectFrom('tenants')
                .select('id')
                .where('slug', '=', role.tenantSlug)
                .executeTakeFirst();
            
            if (!tenant) continue;
            
            await db.insertInto('roles')
                .values({
                    tenant_id: tenant.id,
                    name: role.name,
                })
                .onConflict((oc) => oc
                    .columns(['name', 'tenant_id'])
                    .doNothing()
                )
                .execute();
        }
        
        console.log(`  ✓ Seeded ${ROLES.length} roles`);
        
        // Assign roles to users
        console.log('  → Assigning roles to users...');
        
        for (const assignment of USER_ROLES) {
            const tenant = await db.selectFrom('tenants')
                .select('id')
                .where('slug', '=', assignment.tenantSlug)
                .executeTakeFirst();
            
            if (!tenant) continue;
            
            const user = await db.selectFrom('users')
                .select('id')
                .where('email', '=', assignment.userEmail)
                .where('tenant_id', '=', tenant.id)
                .executeTakeFirst();
            
            const role = await db.selectFrom('roles')
                .select('id')
                .where('name', '=', assignment.roleName)
                .where('tenant_id', '=', tenant.id)
                .executeTakeFirst();
            
            if (!user || !role) continue;
            
            await db.insertInto('user_roles')
                .values({
                    user_id: user.id,
                    role_id: role.id,
                })
                .onConflict((oc) => oc
                    .columns(['user_id', 'role_id'])
                    .doNothing()
                )
                .execute();
        }
        
        console.log(`  ✓ Assigned ${USER_ROLES.length} user-role relations`);
    }
};
