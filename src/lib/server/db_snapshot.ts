// Independent full-database safety snapshots. At most one plain .sqlite3
// file per day is uploaded to the bucket's snapshots/ prefix — a last line
// of defense that shares no code or format with Litestream (hedging against
// e.g. a replication bug corrupting the restore chain), restorable with no
// tooling at all.
//
// Triggered by writes (debounced, from the document save path) and at boot
// (from the reconciliation sweep). Also imported by plain-node scripts,
// which don't remap .js specifiers to .ts files — so the s3 import uses an
// explicit .ts extension, and this file must stay free of $lib imports.

import { DatabaseSync } from 'node:sqlite';
import { readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { backup_enabled, list_keys, put_object } from './s3.ts';

const SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PREFIX = 'snapshots/';

let running = false; // collapse concurrent triggers within this process

// "snapshots/20260712T210000Z.sqlite3" → epoch ms (0 if not a snapshot key)
function key_time(key: string): number {
	const m = key.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z\.sqlite3$/);
	return m ? Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`) : 0;
}

/**
 * Upload a full-database snapshot to the bucket, unless one from the last
 * 24 hours is already there. Never throws — failures are logged and the
 * next trigger retries.
 */
export async function snapshot_if_stale(): Promise<void> {
	if (!backup_enabled() || running) return;
	running = true;
	try {
		const newest = Math.max(0, ...(await list_keys(PREFIX)).map(key_time));
		if (Date.now() - newest < SNAPSHOT_MAX_AGE_MS) return;

		const db_path = join(process.env.DATA_DIR || '/data', 'db.sqlite3');
		const ts = new Date()
			.toISOString()
			.replace(/[-:]/g, '')
			.replace(/\.\d+Z$/, 'Z');
		const tmp = `${db_path}.snapshot-${process.pid}`;

		// Consistent snapshot, safe under concurrent writes (WAL).
		const db = new DatabaseSync(db_path);
		try {
			db.exec(`VACUUM INTO '${tmp}'`);
		} finally {
			db.close();
		}
		try {
			await put_object(`${PREFIX}${ts}.sqlite3`, await readFile(tmp));
		} finally {
			await unlink(tmp).catch(() => {});
		}
		console.log(`[backup] Daily snapshot uploaded: ${PREFIX}${ts}.sqlite3`);
	} catch (err) {
		console.error(
			'[backup] Daily snapshot failed (next write or boot retries):',
			err instanceof Error ? err.message : String(err)
		);
	} finally {
		running = false;
	}
}
