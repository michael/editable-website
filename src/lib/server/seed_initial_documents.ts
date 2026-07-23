import { NAV_1, FOOTER_1, PAGE_1 } from '$lib/demo_doc.js';
import { MEDIA_DEFAULTS } from '$lib/config.js';
import type { DatabaseSync } from 'node:sqlite';
import type { Document } from 'svedit';

/**
 * Deep clone a document and reset all image/video nodes, since a fresh
 * database has no uploaded assets yet.
 */
function reset_media_nodes(doc: Document): Document {
	const cloned = structuredClone(doc);
	for (const node of Object.values(cloned.nodes)) {
		if ('src' in node) Object.assign(node, MEDIA_DEFAULTS);
	}
	return cloned;
}

/** Seed current demo content after a fresh database reaches the current schema. */
export default function seed_initial_documents({ db }: { db: DatabaseSync }) {
	const now = new Date().toISOString();
	const insert_doc = db.prepare(
		'INSERT INTO documents (document_id, type, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
	);
	insert_doc.run('nav_1', 'nav', JSON.stringify(reset_media_nodes(NAV_1)), now, now);
	insert_doc.run('footer_1', 'footer', JSON.stringify(reset_media_nodes(FOOTER_1)), now, now);
	insert_doc.run('page_1', 'page', JSON.stringify(reset_media_nodes(PAGE_1)), now, now);

	db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)').run('home_page_id', 'page_1');
}
