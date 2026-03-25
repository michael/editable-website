import { NAV_1, FOOTER_1, PAGE_1 } from '$lib/demo_doc.js';
import { MEDIA_DEFAULTS } from '$lib/config.js';

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

		db.prepare('INSERT INTO site_settings (key, value) VALUES(?, ?)').run('home_page_id', 'page_1');
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
	function add_footer_fields({ db }) {
		const footer_docs = db.prepare('SELECT document_id, data FROM documents WHERE type = ?').all('footer');
		const update_doc = db.prepare('UPDATE documents SET data = ? WHERE document_id = ?');

		for (const { document_id, data } of footer_docs) {
			if (!data) continue;
			let parsed;
			try {
				parsed = JSON.parse(data);
			} catch {
				continue;
			}
			if (!parsed?.nodes) continue;
			const footer_node = parsed.nodes[document_id];
			if (!footer_node) continue;

			if (!footer_node.team_thumb) {
				if (footer_node.logo) {
					footer_node.team_thumb = footer_node.logo;
				} else {
					const team_thumb_id = `${document_id}_team_thumb`;
					parsed.nodes[team_thumb_id] = {
						id: team_thumb_id,
						type: 'image',
						...MEDIA_DEFAULTS
					};
					footer_node.team_thumb = team_thumb_id;
				}
			}

			if (!footer_node.company_name) {
				footer_node.company_name = { text: 'Company name', annotations: [] };
			}
			if (!footer_node.company_description) {
				footer_node.company_description = { text: 'Short description goes here.', annotations: [] };
			}
			if (!footer_node.company_address) {
				footer_node.company_address = { text: '123 Main St, City', annotations: [] };
			}
			if (!footer_node.company_phone) {
				footer_node.company_phone = { text: '(555) 555-5555', annotations: [] };
			}
			if (!footer_node.team_label) {
				footer_node.team_label = { text: 'Team', annotations: [] };
			}
			if (!footer_node.team_name) {
				footer_node.team_name = { text: 'Agent name', annotations: [] };
			}
			if (!footer_node.team_description) {
				footer_node.team_description = { text: 'Role, short bio, or contact blurb.', annotations: [] };
			}

			update_doc.run(JSON.stringify(parsed), document_id);
		}
	},
	function separate_footer_team_thumb({ db }) {
		const footer_docs = db.prepare('SELECT document_id, data FROM documents WHERE type = ?').all('footer');
		const update_doc = db.prepare('UPDATE documents SET data = ? WHERE document_id = ?');

		for (const { document_id, data } of footer_docs) {
			if (!data) continue;
			let parsed;
			try {
				parsed = JSON.parse(data);
			} catch {
				continue;
			}
			if (!parsed?.nodes) continue;
			const footer_node = parsed.nodes[document_id];
			if (!footer_node) continue;

			const logo_id = footer_node.logo;
			const team_thumb_id = footer_node.team_thumb;

			if (!logo_id) {
				continue;
			}

			const logo_node = parsed.nodes[logo_id];
			if (!logo_node) {
				continue;
			}

			if (!team_thumb_id || team_thumb_id === logo_id) {
				const base_id = `${document_id}_team_thumb`;
				let new_team_thumb_id = base_id;
				let suffix = 1;
				while (parsed.nodes[new_team_thumb_id]) {
					new_team_thumb_id = `${base_id}_${suffix}`;
					suffix += 1;
				}

				parsed.nodes[new_team_thumb_id] = {
					...logo_node,
					id: new_team_thumb_id
				};
				footer_node.team_thumb = new_team_thumb_id;
			}

			update_doc.run(JSON.stringify(parsed), document_id);
		}
	},
	function add_nav_company_name({ db }) {
		const nav_docs = db.prepare('SELECT document_id, data FROM documents WHERE type = ?').all('nav');
		const update_doc = db.prepare('UPDATE documents SET data = ? WHERE document_id = ?');

		for (const { document_id, data } of nav_docs) {
			if (!data) continue;
			let parsed;
			try {
				parsed = JSON.parse(data);
			} catch {
				continue;
			}
			if (!parsed?.nodes) continue;
			const nav_node = parsed.nodes[document_id];
			if (!nav_node) continue;

			if (!nav_node.company_name) {
				nav_node.company_name = { text: 'Company name', annotations: [] };
				update_doc.run(JSON.stringify(parsed), document_id);
			}
		}
	}
];
