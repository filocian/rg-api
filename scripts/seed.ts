#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

/**
 * Database Seeder Script
 * 
 * Usage:
 *   deno run --allow-all scripts/seed.ts
 * 
 * Or via Docker:
 *   docker compose exec rg-api deno run --allow-all scripts/seed.ts
 */

import { identitySeeders } from '../src/identity/infrastructure/database/seeders/index.ts';
import { db } from '../src/shared/infrastructure/database/kysely.ts';

async function runSeeders() {
    console.log('\n🌱 Starting database seeding...\n');
    
    try {
        // Run all identity seeders
        console.log('📦 Identity Module:');
        for (const seeder of identitySeeders) {
            console.log(`  Running ${seeder.name}...`);
            await seeder.run(db);
        }
        
        console.log('\n✅ All seeders completed successfully!\n');
        
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        Deno.exit(1);
    } finally {
        await db.destroy();
    }
}

// Run
runSeeders();
