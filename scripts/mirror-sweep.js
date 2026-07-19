// Asset reconciliation sweep: upload every local asset file the bucket is
// missing. Upload-only — never downloads, never deletes. Content-addressed
// immutable names make a set difference of key listings sufficient proof of
// sync.
//
// Runs at every boot (spawned by run-cloud-boot.js, non-blocking alongside
// the server) as the self-healing pass for upload-time mirrors that failed.
// Standalone: no $lib imports.

import { readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import { s3_enabled, list_keys, put_file } from '../src/lib/server/s3.js';
import { snapshot_if_stale } from '../src/lib/server/db_snapshot.js';

const DATA_DIR = process.env.DATA_DIR || '/data';
const ASSETS_DIR = join(DATA_DIR, 'assets');

const plural = (n, word, words = `${word}s`) => `${n} ${n === 1 ? word : words}`;

if (!s3_enabled()) process.exit(0);

// All asset files as bucket-relative keys, at any depth — the sweep must not
// assume today's layout, or a future asset structure would silently go
// unbacked. Separators are normalized to '/' for bucket keys.
function local_asset_files() {
	let entries;
	try {
		entries = readdirSync(ASSETS_DIR, { recursive: true });
	} catch {
		return []; // No assets directory yet.
	}
	return entries
		.map(String)
		.filter((rel) => !rel.endsWith('.DS_Store') && statSync(join(ASSETS_DIR, rel)).isFile())
		.map((rel) => rel.split(sep).join('/'));
}

const local = local_asset_files();
const remote = new Set(await list_keys('assets/'));
const missing = local.filter((rel) => !remote.has(`assets/${rel}`));

if (missing.length === 0) {
	console.log(`[backup] Sweep: bucket in sync (${plural(local.length, 'asset file')}).`);
} else {
	console.log(
		`[backup] Sweep: uploading ${plural(missing.length, 'asset file')} missing from bucket…`
	);
	let failed = 0;
	for (const rel of missing) {
		try {
			await put_file(`assets/${rel}`, join(ASSETS_DIR, rel));
		} catch (err) {
			failed += 1;
			console.error(`[backup] Sweep upload failed for assets/${rel}:`, err.message);
		}
	}
	console.log(
		failed === 0
			? `[backup] Sweep complete: ${plural(missing.length, 'file')} uploaded.`
			: `[backup] Sweep finished with ${plural(failed, 'failure')} — next boot retries.`
	);
}

// Boot-time trigger for the daily full-database safety snapshot.
await snapshot_if_stale();
