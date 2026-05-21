import { PAGE_1 } from '$lib/demo_doc.js';

// No-op tag for SQL syntax highlighting with the SQL Tagged Template Literals VSCode extension
const sql = (strings) => strings.join('');

/**
 * Deep clone a document and reset all image/video nodes to empty media fields,
 * since a fresh database has no uploaded assets yet.
 */
function reset_media_nodes(doc) {
	const cloned = JSON.parse(JSON.stringify(doc));
	for (const node of Object.values(cloned.nodes)) {
		if ('src' in node) {
			node.src = '';
			node.mime_type = '';
			node.width = 0;
			node.height = 0;
		}
	}
	return cloned;
}

const page_1 = reset_media_nodes(PAGE_1);

export default [
	function initial_schema({ db }) {
		const now = new Date().toISOString();

		db.exec(sql`
			CREATE TABLE documents (
				document_id TEXT NOT NULL PRIMARY KEY,
				type TEXT NOT NULL,
				data TEXT,
				created_at TEXT,
				updated_at TEXT
			);
		`);

		db.exec(sql`
			CREATE TABLE site_settings (
				key TEXT NOT NULL PRIMARY KEY,
				value TEXT
			);
		`);

		db.exec(sql`
			CREATE TABLE document_refs (
				target_document_id TEXT NOT NULL,
				source_document_id TEXT NOT NULL,
				ref_order INTEGER NOT NULL DEFAULT 0,
				PRIMARY KEY (target_document_id, source_document_id)
			);
		`);

		db.exec(sql`
			CREATE TABLE asset_refs (
				asset_id TEXT NOT NULL,
				document_id TEXT NOT NULL,
				PRIMARY KEY (asset_id, document_id)
			);
		`);

		db.exec(sql`
			CREATE TABLE sessions (
				session_id TEXT NOT NULL PRIMARY KEY,
				expires INTEGER NOT NULL
			);
		`);

		db.prepare(
			'INSERT INTO documents (document_id, type, data, created_at, updated_at) VALUES(?, ?, ?, ?, ?)'
		).run('page_1', 'page', JSON.stringify(page_1), now, now);
	}
];
