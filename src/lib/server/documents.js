import db from '$lib/server/db.js';
import { document_schema } from '$lib/document_schema.js';
import nanoid from '../../routes/nanoid.js';

/**
 * @typedef {Object} DocumentRow
 * @property {string} document_id
 * @property {string} type
 * @property {string} data - JSON string containing document data
 */

/**
 * @typedef {Object} DocumentData
 * @property {string} document_id
 * @property {Record<string, any>} nodes
 */

/**
 * Get a single document row from the database.
 * Returns null if not found.
 *
 * @param {string} document_id
 * @returns {DocumentData | null}
 */
export function get_doc_from_db(document_id) {
	const doc_row = /** @type {DocumentRow | undefined} */ (
		db.prepare('SELECT * FROM documents WHERE document_id = ?').get(document_id)
	);
	if (!doc_row) {
		return null;
	}
	return JSON.parse(doc_row.data);
}

/**
 * Get a document from the database, stitching in shared documents (nav, footer).
 * Throws if the base document is not found.
 */
export function stitch_document(document_id) {
	const page_doc = get_doc_from_db(document_id);
	if (!page_doc) {
		throw new Error(`Document not found: ${document_id}`);
	}

	const page_node = page_doc.nodes[page_doc.document_id];

	// Start with the page nodes
	const merged_nodes = { ...page_doc.nodes };

	// Stitch in nav if referenced
	if (page_node?.nav) {
		const nav_doc = get_doc_from_db(page_node.nav);
		if (nav_doc) Object.assign(merged_nodes, nav_doc.nodes);
	}

	// Stitch in footer if referenced
	if (page_node?.footer) {
		const footer_doc = get_doc_from_db(page_node.footer);
		if (footer_doc) Object.assign(merged_nodes, footer_doc.nodes);
	}

	return {
		document_id: page_doc.document_id,
		nodes: merged_nodes
	};
}

/**
 * Creates a blank page structure with a root node linking to nav_1 and footer_1.
 *
 * @param {string} document_id
 * @returns {DocumentData}
 */
export function create_blank_page(document_id, template = 'blank') {
	/** @type {DocumentData} */
	const doc = {
		document_id,
		nodes: {
			[document_id]: {
				id: document_id,
				type: 'page',
				nav: 'nav_1',
				footer: 'footer_1',
				body: []
			}
		}
	};

	if (template === 'post') {
		const hero_id = nanoid();
		const prose_id = nanoid();
		const text_id = nanoid();

		doc.nodes[document_id].body = [hero_id, prose_id];

		doc.nodes[hero_id] = {
			id: hero_id,
			type: 'hero',
			layout: 1,
			colorset: 0,
			title: { text: 'New Blog Post', annotations: [] },
			description: { text: 'Write a short summary or date here.', annotations: [] },
			buttons: []
		};

		doc.nodes[prose_id] = {
			id: prose_id,
			type: 'prose',
			layout: 1,
			colorset: 0,
			content: [text_id]
		};

		doc.nodes[text_id] = {
			id: text_id,
			type: 'text',
			layout: 1,
			content: { text: 'Start writing your post...', annotations: [] }
		};
	}

	return doc;
}
