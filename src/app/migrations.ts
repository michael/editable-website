import { build_migrations } from '#lib/server/migration_registry.js';
import type { Migration, MigrationModule } from '#lib/server/migration_registry.js';
import run_migration_runner from '#lib/server/migration_runner.js';
import seed_initial_documents from './seed_initial_documents.js';
import { db, with_transaction } from './server.js';

const migration_modules = import.meta.glob('./migrations/*.ts', {
	eager: true,
	import: 'default'
}) as Record<string, MigrationModule>;

const migrations: Migration[] = build_migrations(migration_modules);

export function run_migrations() {
	run_migration_runner(migrations, seed_initial_documents, db, with_transaction);
}
