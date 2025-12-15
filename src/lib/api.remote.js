import { getRequestEvent, query } from '$app/server';
import * as v from 'valibot';
import db from './db';

/**
 * @typedef {Object} DocumentRow
 * @property {string} document_id
 * @property {string} data - JSON string containing document data
 */

/**
 * @typedef {Object} DocumentData
 * @property {string} document_id
 * @property {Record<string, any>} nodes
 */

/**
 * Get document data from database
 * @param {string} document_id
 * @returns {DocumentData}
 */
function __get_doc_from_db(document_id) {
	const doc_row = /** @type {DocumentRow} */ (
		db.prepare('SELECT * FROM documents WHERE document_id = ?').get(document_id)
	);
	return JSON.parse(doc_row.data);
}

// Get a document from the database
export const get_document = query(v.string(), async (document_id) => {
	const { locals } = getRequestEvent();
	console.log('debug locals', locals);
	const page_doc = __get_doc_from_db(document_id);
	const nav_doc_id = page_doc.nodes[page_doc.document_id].nav;
	const nav_doc = __get_doc_from_db(nav_doc_id);

	// Merge nav nodes into page document
	return {
		document_id: page_doc.document_id,
		nodes: { ...nav_doc.nodes, ...page_doc.nodes }
	};
});
