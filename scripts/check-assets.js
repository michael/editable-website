// Verify that every asset a database references exists on disk.
//
// Used as a data-integrity gate before a push (locally, against the snapshot)
// and after a push (in-container, against the live volume). Standalone: no
// $lib imports, so it runs against the built image too.
//
// Usage: node --disable-warning=ExperimentalWarning check-assets.js <db_path> <assets_dir>
// Exit codes: 0 = all present, 1 = missing references, 2 = bad usage.

import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const [, , db_path, assets_dir] = process.argv;

if (!db_path || !assets_dir) {
	console.error('usage: check-assets.js <db_path> <assets_dir>');
	process.exit(2);
}

const db = new DatabaseSync(db_path, { readOnly: true });
const rows = /** @type {Array<{ data: string }>} */ (
	db.prepare('SELECT data FROM documents').all()
);

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

const missing = [...referenced].filter((asset_id) => !existsSync(join(assets_dir, asset_id)));

if (missing.length > 0) {
	console.error(`Missing ${missing.length} referenced asset(s):`);
	for (const asset_id of missing) console.error(`  ${asset_id}`);
	process.exit(1);
}

console.log(`OK: all ${referenced.size} referenced assets present`);
