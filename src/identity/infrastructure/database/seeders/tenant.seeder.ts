import { Kysely } from 'kysely';
import { ISeeder } from './seeder.interface.ts';

interface TenantSeed {
    slug: string;
    name: string;
}

const TENANTS: TenantSeed[] = [
    { slug: 'rights-grid', name: 'Rights Grid' },
    { slug: 'acme', name: 'Acme Corp' },
    { slug: 'demo', name: 'Demo Company' },
];

export const TenantSeeder: ISeeder = {
    name: 'TenantSeeder',
    
    async run(db: Kysely<any>): Promise<void> {
        console.log('  → Seeding tenants...');
        
        for (const tenant of TENANTS) {
            await db.insertInto('tenants')
                .values({
                    slug: tenant.slug,
                    name: tenant.name,
                })
                .onConflict((oc) => oc.column('slug').doNothing())
                .execute();
        }
        
        console.log(`  ✓ Seeded ${TENANTS.length} tenants`);
    }
};
