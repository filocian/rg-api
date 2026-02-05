import { Kysely } from 'kysely';
import { PasswordService } from '../../../../shared/infrastructure/security/password.service.ts';
import { ISeeder } from './seeder.interface.ts';

interface UserSeed {
    email: string;
    password: string;
    tenantSlug: string;
}

const USERS: UserSeed[] = [
    { email: 'admin@rights-grid.com', password: 'admin123', tenantSlug: 'rights-grid' },
    { email: 'admin@acme.com', password: 'admin123', tenantSlug: 'acme' },
    { email: 'user@demo.com', password: 'demo123', tenantSlug: 'demo' },
];

export const UserSeeder: ISeeder = {
    name: 'UserSeeder',
    
    async run(db: Kysely<any>): Promise<void> {
        console.log('  → Seeding users...');
        
        for (const user of USERS) {
            // Get tenant ID
            const tenant = await db.selectFrom('tenants')
                .select('id')
                .where('slug', '=', user.tenantSlug)
                .executeTakeFirst();
            
            if (!tenant) {
                console.warn(`    ⚠ Tenant ${user.tenantSlug} not found, skipping user ${user.email}`);
                continue;
            }
            
            // Hash password
            const passwordHash = await PasswordService.hash(user.password);
            
            await db.insertInto('users')
                .values({
                    tenant_id: tenant.id,
                    email: user.email,
                    password_hash: passwordHash,
                })
                .onConflict((oc) => oc
                    .columns(['email', 'tenant_id'])
                    .doNothing()
                )
                .execute();
        }
        
        console.log(`  ✓ Seeded ${USERS.length} users`);
    }
};
