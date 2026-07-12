// Asset reconciliation sweep (PLAN_AUTOMATED_BACKUP.md): upload every local
// asset file the bucket is missing. Upload-only — never downloads, never
// deletes. Content-addressed immutable names make a set difference of key
// listings sufficient proof of sync.
//
// Runs at every boot (spawned by run-cloud-boot.js, non-blocking alongside
// the server) as the self-healing pass for upload-time mirrors that failed.
// Standalone: no $lib imports.

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { s3_enabled, list_keys, put_file } from './s3.js';

const DATA_DIR = process.env.DATA_DIR || '/data';
const ASSETS_DIR = join(DATA_DIR, 'assets');

if (!s3_enabled()) process.exit(0);

// All asset files as bucket-relative keys: "<id>" and "<stem>/w<width>.webp".
function local_asset_files() {
	const files = [];
	let entries;
	try {
		entries = readdirSync(ASSETS_DIR, { withFileTypes: true });
	} catch {
		return files; // No assets directory yet.
	}
	for (const entry of entries) {
		if (entry.name === '.DS_Store') continue;
		if (entry.isFile()) {
			files.push(entry.name);
		} else if (entry.isDirectory()) {
			for (const variant of readdirSync(join(ASSETS_DIR, entry.name))) {
				if (statSync(join(ASSETS_DIR, entry.name, variant)).isFile()) {
					files.push(`${entry.name}/${variant}`);
				}
			}
		}
	}
	return files;
}

const local = local_asset_files();
const remote = new Set(await list_keys('assets/'));
const missing = local.filter((rel) => !remote.has(`assets/${rel}`));

if (missing.length === 0) {
	console.log(`[backup] Sweep: bucket in sync (${local.length} asset file(s)).`);
	process.exit(0);
}

console.log(`[backup] Sweep: uploading ${missing.length} asset file(s) missing from bucket…`);
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
		? `[backup] Sweep complete: ${missing.length} file(s) uploaded.`
		: `[backup] Sweep finished with ${failed} failure(s) — next boot retries.`
);
