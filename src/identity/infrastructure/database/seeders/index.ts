/**
 * Identity Module Seeders
 * 
 * Seeders are executed in order:
 * 1. Tenants (no dependencies)
 * 2. Users (depends on tenants)
 * 3. Roles + User-Role assignments (depends on users and tenants)
 */

export { RoleSeeder } from './role.seeder.ts';
export type { ISeeder } from './seeder.interface.ts';
export { TenantSeeder } from './tenant.seeder.ts';
export { UserSeeder } from './user.seeder.ts';

import { RoleSeeder } from './role.seeder.ts';
import { ISeeder } from './seeder.interface.ts';
import { TenantSeeder } from './tenant.seeder.ts';
import { UserSeeder } from './user.seeder.ts';

/**
 * All identity seeders in execution order
 */
export const identitySeeders: ISeeder[] = [
    TenantSeeder,
    UserSeeder,
    RoleSeeder,
];
