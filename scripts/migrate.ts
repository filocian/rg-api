import { FileMigrationProvider, Migrator } from 'kysely';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { db } from '../src/shared/infrastructure/database/kysely.ts';

async function migrate() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // Path relative to where the script is run (apps/rg-api)
      migrationFolder: path.join(Deno.cwd(), 'src/identity/infrastructure/database/migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    Deno.exit(1);
  }

  await db.destroy();
}

migrate();
