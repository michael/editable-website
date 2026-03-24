import { error } from '@sveltejs/kit';
import { stitch_document } from '$lib/server/documents.js';
import db from '$lib/server/db.js';

export async function load({ params }) {
	const document_id = params.id;
	let doc;

	try {
		doc = stitch_document(document_id);
	} catch (err) {
		throw error(404, 'Page not found');
	}

	// Extract title from the first text node in the body, if any
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
		doc,
		title,
		has_backend: true
	};
}
