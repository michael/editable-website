// Frozen at this migration's creation time; historical migrations must not
// change when current application defaults evolve.
const IMAGE_DEFAULTS = {
	src: '',
	mime_type: '',
	width: 0,
	height: 0,
	alt: '',
	scale: 1.0,
	focal_point_x: 0.5,
	focal_point_y: 0.5,
	object_fit: 'contain'
};

function create_empty_image_node(id) {
	return {
		id,
		type: 'image',
		...IMAGE_DEFAULTS
	};
}

export default {
	up({ db }) {
		const page_rows = db
			.prepare('SELECT document_id, data FROM documents WHERE type = ?')
			.all('page');
		const update_doc = db.prepare('UPDATE documents SET data = ? WHERE document_id = ?');

		for (const row of page_rows) {
			const doc = JSON.parse(row.data);
			const page_node = doc?.nodes?.[doc.document_id];

			if (!page_node || page_node.type !== 'page') continue;

			let did_change = false;
			const page_image_id =
				typeof page_node.image === 'string' ? page_node.image : `${doc.document_id}_image`;

			if (typeof page_node.image !== 'string') {
				page_node.image = page_image_id;
				did_change = true;
			}

			const page_image_node = doc.nodes?.[page_image_id];
			if (!page_image_node || page_image_node.type !== 'image') {
				doc.nodes[page_image_id] = create_empty_image_node(page_image_id);
				did_change = true;
			}

			if (did_change) update_doc.run(JSON.stringify(doc), row.document_id);
		}
	}
};
