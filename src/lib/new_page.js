import nanoid from '../routes/nanoid.js';

function empty_annotated_text() {
	return {
		text: '',
		annotations: []
	};
}

/**
 * Create a new unsaved self-contained presentation document for the `/new` route.
 *
 * The page id is generated on the client up front and used for both:
 * - the document's `document_id`
 * - the root page node's `id`
 *
 * @returns {{ document_id: string, nodes: Record<string, any> }}
 */
export function create_empty_doc() {
	const page_id = nanoid();
	const hero_id = nanoid();

	return {
		document_id: page_id,
		nodes: {
			[page_id]: {
				id: page_id,
				type: 'page',
				body: [hero_id]
			},
			[hero_id]: {
				id: hero_id,
				type: 'hero',
				layout: 1,
				colorset: 0,
				title: empty_annotated_text(),
				description: empty_annotated_text(),
				buttons: []
			}
		}
	};
}
