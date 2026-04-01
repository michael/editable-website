import nanoid from '../routes/nanoid.js';

/**
 * Create a new unsaved page document for the `/new` route.
 *
 * The page id is generated on the client up front and used for both:
 * - the document's `document_id`
 * - the root page node's `id`
 *
 * The page references the current shared nav/footer roots so it behaves like a
 * normal page immediately, but it is only persisted on first save.
 *
 * @returns {{ document_id: string, nodes: Record<string, any> }}
 */
export function create_empty_doc() {
	const page_id = nanoid();
	const prose_id = nanoid();
	const heading_id = nanoid();
	const paragraph_id = nanoid();

	return {
		document_id: page_id,
		nodes: {
			[page_id]: {
				id: page_id,
				type: 'page',
				nav: 'nav_1',
				footer: 'footer_1',
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