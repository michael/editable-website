import { NAV_1, FOOTER_1, PAGE_1 } from '$lib/demo_doc.js';
import { MEDIA_DEFAULTS } from '$lib/config.js';
import slugify from 'slugify';

// No-op tag for SQL syntax highlighting with the SQL Tagged Template Literals VSCode extension
const sql = (strings) => strings.join('');

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

/**
 * @param {any} content
 * @returns {string}
 */
function extract_plain_text(content) {
	return content?.text?.trim?.() || '';
}

/**
 * @param {{ document_id: string, nodes: Record<string, any> }} page_doc
 * @returns {string}
 */
function summarize_page_title(page_doc) {
	const page_root = page_doc.nodes[page_doc.document_id];
	if (!page_root || !Array.isArray(page_root.body)) return 'Untitled page';

	let explicit_title = '';
	let heading_title = '';
	let fallback_title = '';

	for (const node_id of page_root.body) {
		const node = page_doc.nodes[node_id];
		if (!node) continue;

		if (node.type === 'text') {
			const text = extract_plain_text(node.content);
			if (!text) continue;

			if (!heading_title && (node.layout === 2 || node.layout === 3 || node.layout === 4)) {
				heading_title = text;
			}

			if (!fallback_title) {
				fallback_title = text;
			}
		}

		if (node.type === 'hero') {
			const hero_title = extract_plain_text(node.title);
			if (!explicit_title && hero_title) {
				explicit_title = hero_title;
			}

			if (!fallback_title && hero_title) {
				fallback_title = hero_title;
			}

			const hero_description = extract_plain_text(node.description);
			if (!fallback_title && hero_description) {
				fallback_title = hero_description;
			}
		}

		if (node.type === 'link_collection_item') {
			const item_title = extract_plain_text(node.title);
			if (!fallback_title && item_title) {
				fallback_title = item_title;
			}
		}
	}

	return explicit_title || heading_title || fallback_title || 'Untitled page';
}

/**
 * @param {string} document_id
 * @param {string} title
 * @returns {string}
 */
function create_initial_slug(document_id, title) {
	const slug = slugify(title, { lower: true, strict: true, trim: true });
	return slug || document_id;
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
				PRIMARY KEY (target_document_id, source_document_id)
			);
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
	function add_asset_refs({ db }) {
		db.exec(`
			CREATE TABLE asset_refs (
				asset_id TEXT NOT NULL,
				document_id TEXT NOT NULL,
				PRIMARY KEY (asset_id, document_id)
			)
		`);
	},
	function add_document_ref_order({ db }) {
		db.exec(`
			ALTER TABLE document_refs ADD COLUMN ref_order INTEGER NOT NULL DEFAULT 0
		`);

		db.exec(`
			DELETE FROM document_refs
		`);
	},
	function add_document_slugs({ db }) {
		db.exec(`
			CREATE TABLE document_slugs (
				slug TEXT NOT NULL PRIMARY KEY,
				document_id TEXT NOT NULL,
				is_active INTEGER NOT NULL DEFAULT 0,
				created_at TEXT NOT NULL
			)
		`);

		db.exec(`
			CREATE UNIQUE INDEX document_slugs_active_document_id_idx
			ON document_slugs (document_id)
			WHERE is_active = 1
		`);

		const page_rows = db
			.prepare('SELECT document_id, data FROM documents WHERE type = ? ORDER BY document_id')
			.all('page');

		const insert_slug = db.prepare(
			'INSERT INTO document_slugs (slug, document_id, is_active, created_at) VALUES (?, ?, ?, ?)'
		);

		const used_slugs = new Set();
		const created_at = new Date().toISOString();

		for (const row of page_rows) {
			const page_doc = JSON.parse(row.data);
			const title = summarize_page_title(page_doc);
			const base_slug = create_initial_slug(row.document_id, title);

			let slug = base_slug;
			let suffix = 2;
			while (used_slugs.has(slug)) {
				slug = `${base_slug}-${suffix}`;
				suffix += 1;
			}

			used_slugs.add(slug);
			insert_slug.run(slug, row.document_id, 1, created_at);
		}
	}
];
