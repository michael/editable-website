import { redirect, fail } from '@sveltejs/kit';
import db from '$lib/server/db.js';
import { create_blank_page } from '$lib/server/documents.js';
import nanoid from '../nanoid.js';

export async function load() {
	const query = `
		WITH RECURSIVE reachable(document_id) AS (
			SELECT value FROM site_settings WHERE key = 'home_page_id'
			UNION SELECT 'nav_1'
			UNION SELECT 'footer_1'
			UNION
			SELECT target_document_id FROM document_refs
			JOIN reachable ON reachable.document_id = source_document_id
		)
		SELECT d.document_id, d.data,
			CASE WHEN r.document_id IS NOT NULL THEN 'public' ELSE 'draft' END AS status
		FROM documents d
		LEFT JOIN reachable r ON d.document_id = r.document_id
		WHERE d.type = 'page'
		ORDER BY status ASC, d.document_id ASC;
	`;

	const rows = db.prepare(query).all();

	const pages = rows.map((row) => {
		const doc = JSON.parse(/** @type {string} */ (row.data));
		let title = 'Untitled Page';
		const page_node = doc.nodes[doc.document_id];
		if (page_node && page_node.body) {
			for (const node_id of page_node.body) {
				const child = doc.nodes[node_id];
				if (child && child.type === 'prose' && child.content) {
					const first_text = doc.nodes[child.content[0]];
					if (first_text && first_text.type === 'text' && first_text.content?.text) {
						title = first_text.content.text.substring(0, 60);
						break;
					}
				}
			}
		}

		return {
			document_id: row.document_id,
			status: row.status,
			title
		};
	});

	// Get home page id to prevent deletion
	const home_row = db.prepare("SELECT value FROM site_settings WHERE key = 'home_page_id'").get();
	const home_page_id = home_row ? home_row.value : 'page_1';

	return { pages, home_page_id };
}

export const actions = {
	create: async () => {
		// Create a new blank page
		const new_id = nanoid();
		const blank_doc = create_blank_page(new_id, 'blank');

		db.prepare('INSERT INTO documents (document_id, type, data) VALUES(?, ?, ?)').run(
			new_id,
			'page',
			JSON.stringify(blank_doc)
		);

		throw redirect(303, `/${new_id}`);
	},
	create_post: async () => {
		// Create a new blog post
		const new_id = nanoid();
		const post_doc = create_blank_page(new_id, 'post');

		db.prepare('INSERT INTO documents (document_id, type, data) VALUES(?, ?, ?)').run(
			new_id,
			'page',
			JSON.stringify(post_doc)
		);

		throw redirect(303, `/${new_id}`);
	},
	delete: async ({ request }) => {
		const data = await request.formData();
		const id_to_delete = data.get('id');

		if (!id_to_delete || typeof id_to_delete !== 'string') {
			return fail(400, { error: 'Invalid ID' });
		}

		const home_row = db.prepare("SELECT value FROM site_settings WHERE key = 'home_page_id'").get();
		const home_page_id = home_row ? home_row.value : 'page_1';

		if (id_to_delete === home_page_id) {
			return fail(400, { error: 'Cannot delete the home page' });
		}

		// Delete from database
		db.exec('BEGIN');
		try {
			db.prepare('DELETE FROM asset_refs WHERE document_id = ?').run(id_to_delete);
			db.prepare('DELETE FROM document_refs WHERE source_document_id = ?').run(id_to_delete);
			db.prepare('DELETE FROM document_refs WHERE target_document_id = ?').run(id_to_delete);
			db.prepare('DELETE FROM documents WHERE document_id = ? AND type = ?').run(
				id_to_delete,
				'page'
			);
			db.exec('COMMIT');
		} catch (err) {
			db.exec('ROLLBACK');
			return fail(500, { error: 'Failed to delete document' });
		}

		throw redirect(303, '/sitemap');
	}
};
