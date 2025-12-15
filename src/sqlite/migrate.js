import migrations from './migrations.js';
// import { DatabaseSync } from 'node:sqlite';
// import { loadEnv } from 'vite';
import db from '$lib/db';
// const env = loadEnv('production', '.', '');

// const db = new DatabaseSync(env.DB_PATH, {
// 	// enableForeignKeyConstraints: true
// });

function sleep_sync(ms) {
	const start = Date.now();
	while (Date.now() - start < ms) {
		// Blocking loop
	}
}

export default function migrate() {
	// Invariants
	const migration_names = migrations.map((migration) => migration.name);
	if (new Set(migration_names).size !== migration_names.length) {
			throw new Error('Duplicate migration names. Check migrations.js for unique function names.');
	}

	// Add _migrations tracker table if it doesn't exist yet.
	db.exec(`
			CREATE TABLE IF NOT EXISTS _migrations (
				id TEXT PRIMARY KEY NOT NULL,
				timestamp TEXT NOT NULL
			)
	`);

	// Fetch latest migration that has already been applied
	const latest = db
			.prepare(
				`
	  SELECT id, timestamp FROM _migrations
	  ORDER BY timestamp DESC
	  LIMIT 1
	`
			)
			.get();

	let remaining_migrations;
	if (latest) {
			console.log(`Latest migration: ${latest.id} at ${latest.timestamp}`);
			const latest_index = migrations.findIndex((migration) => migration.name === latest.id);

			if (latest_index >= 0) {
				remaining_migrations = migrations.slice(latest_index + 1);
			} else {
				console.log(
					`Migration ${latest.id} is not found in migrations.js. Make sure to keep all migrations in sync between your local and production environment.`
				);
				remaining_migrations = []; // we just skip migrations
			}
	} else {
			console.log(`No previous migrations found.`);
			remaining_migrations = migrations;
	}

	console.log(`${remaining_migrations.length} migrations to be applied...`);

	// The whole migration operation is wrapped in a transaction, so if something fails, everything is
	// rolled back. When migrations are done as part of the deploy process this means the deploy failed
	// You likely have a bug in the migration code, which needs to be fixed before you can make a
	// successful deploy.
	db.exec('BEGIN TRANSACTION');

	try {
			for (const migration of remaining_migrations) {
				const migration_name = migration.name;
				if (!migration_name) throw new Error('Migration name (e.g. add_name_to_user) is required.');

				console.log('Running migration... ', migration_name);
				// Run the migration and provide api as a context
				migration({ db });
				// Save migration to _migrations table
				db.prepare(`
					INSERT INTO _migrations (id, timestamp)
					VALUES (?, ?)
				`).run(migration_name, new Date().toISOString());

				sleep_sync(100); // this makes sure we don't end up with the same timestamp for multiple migrations (if they run too fast)
			}
			db.exec('COMMIT');
	} catch (error) {
			db.exec('ROLLBACK');
			throw error;
	}
}
