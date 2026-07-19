function create_empty_text() {
	return {
		content: '',
		marks: [],
		annotations: []
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
			if (!page_node.title) {
				page_node.title = create_empty_text();
				did_change = true;
			}
			if (!page_node.description) {
				page_node.description = create_empty_text();
				did_change = true;
			}

			if (did_change) update_doc.run(JSON.stringify(doc), row.document_id);
		}
	}
};
