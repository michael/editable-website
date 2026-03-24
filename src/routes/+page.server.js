import { error } from '@sveltejs/kit';
import { stitch_document } from '$lib/server/documents.js';
import db from '$lib/server/db.js';

export async function load({ parent }) {
	const parent_data = await parent();
	const has_backend = parent_data.has_backend;

	if (!has_backend) {
		return { has_backend };
	}

	// Fetch home_page_id from site_settings
	const row = db.prepare("SELECT value FROM site_settings WHERE key = 'home_page_id'").get();
	const home_page_id = row ? row.value : 'page_1';

	let doc;
	try {
		doc = stitch_document(home_page_id);
	} catch (err) {
		throw error(404, 'Home page document not found');
	}

	// Extract title
	let title = 'Home';
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
		doc,
		title,
		has_backend
	};
}
