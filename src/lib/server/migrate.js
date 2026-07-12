import migrations from './migrations.js';
import db, { with_transaction } from './db.js';

export default function migrate() {
	// Invariants — fail before running anything.
	const migration_names = migrations.map((migration) => migration.name);
	if (migration_names.some((name) => !name)) {
		throw new Error(
			'Every migration must be a named function (e.g. add_name_to_user). Check migrations.js for anonymous functions.'
		);
	}
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

	// A migration is pending iff its name was never recorded. Identity, not
	// ordering: deciding via "newest timestamp + array position" breaks on
	// timestamp ties (migrations applied in the same millisecond) and when a
	// migration is inserted before an already-applied one.
	const applied = new Set(
		/** @type {Array<{ id: string }>} */ (db.prepare('SELECT id FROM _migrations').all()).map(
			(row) => row.id
		)
	);
	const remaining_migrations = migrations.filter((migration) => !applied.has(migration.name));

	// Recorded names missing from migrations.js are normal for a database
	// that is ahead of this code — but they are also the symptom of renaming
	// an applied migration (never do that), so make them visible.
	const known = new Set(migration_names);
	const unknown = [...applied].filter((id) => !known.has(id));
	if (unknown.length > 0) {
		console.log(
			`Note: ${unknown.length} recorded migration(s) not present in migrations.js: ${unknown.join(', ')}`
		);
	}

	console.log(`${applied.size} migrations applied, ${remaining_migrations.length} to be applied...`);

	// The whole migration operation is wrapped in a transaction, so if something fails, everything is
	// rolled back. When migrations are done as part of the deploy process this means the deploy failed.
	// You likely have a bug in the migration code, which needs to be fixed before you can make a
	// successful deploy.
	with_transaction(() => {
		for (const migration of remaining_migrations) {
			const migration_name = migration.name;
			console.log('Running migration... ', migration_name);
			// Run the migration and provide db as context
			migration({ db });
			// Save migration to _migrations table
			db.prepare(
				`
				INSERT INTO _migrations (id, timestamp)
				VALUES (?, ?)
			`
			).run(migration_name, new Date().toISOString());
		}
	});
}
