// Compose a converted markdown page document with the site's shared nav and
// footer documents, then fill defaults and validate against the schema —
// mirroring what `get_combined_document` produces for database pages.

import { fill_document_defaults, validate_document } from 'svedit';
import { document_schema } from '$lib/document_schema.js';

/**
 * @param {{ document_id: string, nodes: Record<string, any> }} page_doc -
 *   Converted markdown document (without nav/footer)
 * @param {{
 *   nav_document: { document_id: string, nodes: Record<string, any> },
 *   footer_document: { document_id: string, nodes: Record<string, any> }
 * }} shared_documents
 * @returns {{ document_id: string, nodes: Record<string, any> }}
 */
export function compose_markdown_document(page_doc, shared_documents) {
	const nav_document = shared_documents?.nav_document;
	const footer_document = shared_documents?.footer_document;

	if (!nav_document?.document_id || !nav_document?.nodes) {
		throw new Error('Missing nav document for markdown page composition.');
	}
	if (!footer_document?.document_id || !footer_document?.nodes) {
		throw new Error('Missing footer document for markdown page composition.');
	}

	const shared_nodes = {
		...structuredClone(nav_document.nodes),
		...structuredClone(footer_document.nodes)
	};

	for (const node_id of Object.keys(page_doc.nodes)) {
		if (node_id in shared_nodes) {
			throw new Error(`Markdown node id "${node_id}" collides with a shared nav/footer node id.`);
		}
	}

	const nodes = { ...shared_nodes, ...page_doc.nodes };
	nodes[page_doc.document_id] = {
		...nodes[page_doc.document_id],
		nav: nav_document.document_id,
		footer: footer_document.document_id
	};

	const doc = fill_document_defaults({ document_id: page_doc.document_id, nodes }, document_schema);
	validate_document(doc, document_schema);
	return doc;
}
