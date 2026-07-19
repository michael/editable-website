const MIGRATION_FILENAME_PATTERN = /^\d{8}T\d{9}Z_[a-z][a-z0-9-]*_[a-z0-9]+(?:_[a-z0-9]+)*\.ts$/;

export type MigrationModule = { before?: string[]; up: (context: { db: any }) => unknown };
export type Migration = MigrationModule & { id: string };

const migration_modules = import.meta.glob('./migrations/*.ts', {
	eager: true,
	import: 'default'
}) as Record<string, MigrationModule>;

// Vite resolves this literal glob at build time. Sorting the paths gives
// timestamp order without a central registry that custom migrations must edit.
export default Object.entries(migration_modules)
	.sort(([left], [right]) => left.localeCompare(right))
	.map(([path, migration]) => {
		const filename = path.split('/').at(-1) ?? '';
		if (!MIGRATION_FILENAME_PATTERN.test(filename)) {
			throw new Error(`Invalid migration filename "${filename}".`);
		}

		if (!migration || typeof migration !== 'object') {
			throw new Error(`Migration "${filename}" must have a default object export.`);
		}
		const unknown_keys = Object.keys(migration).filter((key) => !['before', 'up'].includes(key));
		if (unknown_keys.length > 0) {
			throw new Error(
				`Migration "${filename}" has unknown export properties: ${unknown_keys.join(', ')}.`
			);
		}

		return { id: filename.slice(0, -'.ts'.length), ...migration };
	});
