// Download the assets referenced by the local database from the backup
// bucket. Restores only the working set: originals the database references,
// plus their width variants. Unreferenced history stays in the bucket.
// Skips files already on disk, so it is resumable and cheap to re-run.
//
// Used by disaster recovery at boot (run-cloud-boot.js) and by
// `data.sh pull-cloud`. Standalone: no $lib imports.
//
// Usage: node --disable-warning=ExperimentalWarning restore-assets.js
// Paths derive from DATA_DIR (default /data).

import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { s3_enabled, get_object, list_keys } from './s3.js';

const DATA_DIR = process.env.DATA_DIR || '/data';
const DB_PATH = join(DATA_DIR, 'db.sqlite3');
const ASSETS_DIR = join(DATA_DIR, 'assets');

if (!s3_enabled()) {
	console.error('BUCKET_NAME not set — nothing to restore from.');
	process.exit(2);
}

// Same reference walk as check-assets.js.
const db = new DatabaseSync(DB_PATH, { readOnly: true });
const rows = /** @type {Array<{ data: string }>} */ (
	db.prepare('SELECT data FROM documents').all()
);
db.close();

const referenced = new Set();
for (const row of rows) {
	const doc = JSON.parse(row.data);
	for (const node of Object.values(doc.nodes ?? {})) {
		if (
			(node.type === 'image' || node.type === 'video') &&
			typeof node.src === 'string' &&
			node.src &&
			!node.src.startsWith('blob:')
		) {
			referenced.add(node.src);
		}
	}
}

const stem = (id) => (extname(id) ? id.slice(0, -extname(id).length) : id);
const stems = new Set([...referenced].map(stem));

// One bucket listing, then select originals and variant files of referenced assets.
const wanted = [];
for (const key of await list_keys('assets/')) {
	const rel = key.slice('assets/'.length);
	if (!rel) continue;
	const is_variant = rel.includes('/');
	if (is_variant ? stems.has(rel.split('/')[0]) : referenced.has(rel)) {
		if (!existsSync(join(ASSETS_DIR, rel))) wanted.push(rel);
	}
}

console.log(`[backup] Restoring ${wanted.length} asset file(s) for ${referenced.size} referenced asset(s)…`);

let failed = 0;
for (const rel of wanted) {
	try {
		const dest = join(ASSETS_DIR, rel);
		await mkdir(dirname(dest), { recursive: true });
		await writeFile(dest, await get_object(`assets/${rel}`));
	} catch (err) {
		failed += 1;
		console.error(`[backup] Failed to restore assets/${rel}:`, err.message);
	}
}

if (failed > 0) {
	console.error(`[backup] ${failed} asset file(s) failed to restore — re-run to retry.`);
	process.exit(1);
}
console.log('[backup] Asset restore complete.');
