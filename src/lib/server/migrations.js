import { NAV_1, FOOTER_1, PAGE_1 } from '$lib/demo_doc.js';

// No-op tag for SQL syntax highlighting with the SQL Tagged Template Literals VSCode extension
const sql = (strings) => strings.join('');

/**
 * Deep clone a document and clear all image/video src values,
 * since a fresh database has no uploaded assets yet.
 */
function clear_asset_srcs(doc) {
	const cloned = JSON.parse(JSON.stringify(doc));
	for (const node of Object.values(cloned.nodes)) {
		if ('src' in node) {
			node.src = '';
		}
	}
	return cloned;
}

const nav_1 = clear_asset_srcs(NAV_1);
const footer_1 = clear_asset_srcs(FOOTER_1);
const page_1 = clear_asset_srcs(PAGE_1);

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
	}
];
