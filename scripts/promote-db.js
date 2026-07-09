// Boot-time database promotion.
//
// A push/restore stages a consistent database snapshot at
// `$DATA_DIR/incoming/db.sqlite3` and restarts the machine. This runs on boot
// — before the app opens the database — and atomically swaps the staged
// snapshot into place. Doing the swap while no connection is open is what
// makes the operation safe: there is no live SQLite handle to corrupt.
//
// The staged file is a `VACUUM INTO` snapshot: self-contained, with no WAL.
// Any leftover WAL/SHM belong to the outgoing database and must be removed so
// they are not replayed on top of the new file.

import { existsSync, statSync, rmSync, renameSync, readdirSync, rmdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = process.env.DATA_DIR || '/data';

export function promote_incoming() {
	const staging_dir = join(DATA_DIR, 'incoming');
	const staged_db = join(staging_dir, 'db.sqlite3');

	if (!existsSync(staged_db) || statSync(staged_db).size === 0) return;

	const live_db = join(DATA_DIR, 'db.sqlite3');

	rmSync(`${live_db}-wal`, { force: true });
	rmSync(`${live_db}-shm`, { force: true });
	renameSync(staged_db, live_db); // atomic within the same volume

	// Clear the staging dir so the swap runs exactly once.
	try {
		for (const entry of readdirSync(staging_dir)) {
			rmSync(join(staging_dir, entry), { recursive: true, force: true });
		}
		rmdirSync(staging_dir);
	} catch {
		// Best effort — a non-empty leftover would only be re-cleared next boot.
	}

	console.log('[promote] Swapped in staged database from incoming/');
}
