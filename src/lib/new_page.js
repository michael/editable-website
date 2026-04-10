import nanoid from '../routes/nanoid.js';

/**
 * Create a new unsaved page document for the `/new` route.
 *
 * The page id is generated on the client up front and used for both:
 * - the document's `document_id`
 * - the root page node's `id`
 *
 * The shared nav/footer nodes are provided by the server so the new page is
 * composed from the current database-backed shared documents rather than the
 * demo seed data.
 *
 * @param {{
 *   nav_document: { document_id: string, nodes: Record<string, any> },
 *   footer_document: { document_id: string, nodes: Record<string, any> }
 * }} shared_documents
 * @returns {{ document_id: string, nodes: Record<string, any> }}
 */
export function create_empty_doc(shared_documents) {
	const page_id = nanoid();
	const prose_id = nanoid();
	const heading_id = nanoid();
	const paragraph_id = nanoid();

	const nav_document = shared_documents?.nav_document;
	const footer_document = shared_documents?.footer_document;

	if (!nav_document?.document_id || !nav_document?.nodes) {
		throw new Error('Missing nav document for new page creation');
	}

	if (!footer_document?.document_id || !footer_document?.nodes) {
		throw new Error('Missing footer document for new page creation');
	}

	return {
		document_id: page_id,
		nodes: {
			...structuredClone(nav_document.nodes),
			...structuredClone(footer_document.nodes),
			[page_id]: {
				id: page_id,
				type: 'page',
				nav: nav_document.document_id,
				footer: footer_document.document_id,
				body: [prose_id]
			},
			[prose_id]: {
				id: prose_id,
				type: 'prose',
				layout: 1,
				colorset: 0,
				content: [heading_id, paragraph_id]
			},
			[heading_id]: {
				id: heading_id,
				type: 'text',
				layout: 2,
				content: {
					text: '',
					annotations: []
				}
			},
			[paragraph_id]: {
				id: paragraph_id,
				type: 'text',
				layout: 1,
				content: {
					text: '',
					annotations: []
				}
			}
		}
	};
}