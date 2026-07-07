import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, rmSync } from 'node:fs';
import { DATA_DIR, DB_PATH } from '$lib/server_config.js';

// If SEED=1, wipe the data directory before opening the database.
// This must happen here (before the connection opens), not in init(),
// because db.js is imported at module load time — before init() runs.
if (process.env.SEED === '1') {
	console.log('[seed] Wiping data directory and re-seeding...');
	rmSync(DATA_DIR, { recursive: true, force: true });
}

// Ensure the data directory exists
mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.exec('PRAGMA journal_mode=WAL');

/**
 * Run fn inside an immediate transaction, committing on return and
 * rolling back on error.
 *
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export function with_transaction(fn) {
	db.exec('BEGIN IMMEDIATE');
	try {
		const result = fn();
		db.exec('COMMIT');
		return result;
	} catch (err) {
		db.exec('ROLLBACK');
		throw err;
	}
}

export default db;
