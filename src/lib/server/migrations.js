import { NAV_1, FOOTER_1, PAGE_1 } from '$lib/demo_doc.js';
import { MEDIA_DEFAULTS } from '$lib/config.js';

// No-op tag for SQL syntax highlighting with the SQL Tagged Template Literals VSCode extension
const sql = (strings) => strings.join('');

function create_empty_annotated_text() {
	return {
		text: '',
		annotations: []
	};
}

function create_empty_image_node(id) {
	return {
		id,
		type: 'image',
		...MEDIA_DEFAULTS
	};
}

/**
 * Deep clone a document and reset all image/video nodes to MEDIA_DEFAULTS,
 * since a fresh database has no uploaded assets yet.
 */
function reset_media_nodes(doc) {
	const cloned = JSON.parse(JSON.stringify(doc));
	for (const node of Object.values(cloned.nodes)) {
		if ('src' in node) {
			Object.assign(node, MEDIA_DEFAULTS);
		}
	}
	return cloned;
}

const nav_1 = reset_media_nodes(NAV_1);
const footer_1 = reset_media_nodes(FOOTER_1);
const page_1 = reset_media_nodes(PAGE_1);

export default [
	function initial_schema({ db }) {
		db.exec(sql`
			CREATE TABLE documents (
				document_id TEXT NOT NULL PRIMARY KEY,
				type TEXT NOT NULL,
				data TEXT
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
			CREATE TABLE document_slugs (
				slug TEXT NOT NULL PRIMARY KEY,
				document_id TEXT NOT NULL,
				is_active INTEGER NOT NULL DEFAULT 0,
				created_at TEXT NOT NULL
			);
		`);

		db.exec(sql`
			CREATE TABLE sessions (
				session_id TEXT NOT NULL PRIMARY KEY,
				expires INTEGER NOT NULL
			);
		`);

		db.exec(sql`
			CREATE UNIQUE INDEX document_slugs_active_document_id_idx
			ON document_slugs (document_id)
			WHERE is_active = 1
		`);

		const insert_doc = db.prepare(
			'INSERT INTO documents (document_id, type, data) VALUES(?, ?, ?)'
		);
		insert_doc.run('nav_1', 'nav', JSON.stringify(nav_1));
		insert_doc.run('footer_1', 'footer', JSON.stringify(footer_1));
		insert_doc.run('page_1', 'page', JSON.stringify(page_1));

		db.prepare('INSERT INTO site_settings (key, value) VALUES(?, ?)').run(
			'home_page_id',
			'page_1'
		);
	},
	function add_page_metadata_fields({ db }) {
		const page_rows = db.prepare('SELECT document_id, data FROM documents WHERE type = ?').all('page');
		const update_doc = db.prepare('UPDATE documents SET data = ? WHERE document_id = ?');

		for (const row of page_rows) {
			const doc = JSON.parse(row.data);
			const page_node = doc?.nodes?.[doc.document_id];

			if (!page_node || page_node.type !== 'page') continue;

			let did_change = false;

			if (!page_node.title) {
				page_node.title = create_empty_annotated_text();
				did_change = true;
			}

			if (!page_node.description) {
				page_node.description = create_empty_annotated_text();
				did_change = true;
			}

			if (did_change) {
				update_doc.run(JSON.stringify(doc), row.document_id);
			}
		}
	},
	function add_page_image_nodes({ db }) {
		const page_rows = db.prepare('SELECT document_id, data FROM documents WHERE type = ?').all('page');
		const update_doc = db.prepare('UPDATE documents SET data = ? WHERE document_id = ?');

		for (const row of page_rows) {
			const doc = JSON.parse(row.data);
			const page_node = doc?.nodes?.[doc.document_id];

			if (!page_node || page_node.type !== 'page') continue;

			let did_change = false;
			const page_image_id = typeof page_node.image === 'string' ? page_node.image : `${doc.document_id}_image`;

			if (typeof page_node.image !== 'string') {
				page_node.image = page_image_id;
				did_change = true;
			}

			const page_image_node = doc.nodes?.[page_image_id];
			if (!page_image_node || page_image_node.type !== 'image') {
				doc.nodes[page_image_id] = create_empty_image_node(page_image_id);
				did_change = true;
			}

			if (did_change) {
				update_doc.run(JSON.stringify(doc), row.document_id);
			}
		}
	},
	function add_document_timestamps({ db }) {
		const now = new Date().toISOString();

		db.exec(sql`
			ALTER TABLE documents ADD COLUMN created_at TEXT
		`);
		db.exec(sql`
			ALTER TABLE documents ADD COLUMN updated_at TEXT
		`);

		db.prepare(
			`
				UPDATE documents
				SET created_at = COALESCE(created_at, ?),
					updated_at = COALESCE(updated_at, ?)
			`
		).run(now, now);
	}
];