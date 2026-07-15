// Frozen at this migration's creation time; historical migrations must not
// change when current layout names or ordering evolve.
const LEGACY_LAYOUT_IDS = {
	prose: [
		'narrow-left',
		'narrow-center',
		'narrow-right',
		'narrow-centered-text',
		'wide-left',
		'wide-centered-text'
	],
	prose_grid: ['plain', 'cards'],
	paragraph: ['default', 'muted'],
	paragraph_sm: ['default', 'muted'],
	paragraph_lg: ['default', 'muted'],
	paragraph_xl: ['default', 'muted'],
	heading_1_xl: ['default', 'muted'],
	heading_1: ['default', 'muted'],
	heading_2: ['default', 'muted'],
	heading_3: ['default', 'muted'],
	heading_4: ['default', 'muted'],
	list: ['square', 'check', 'decimal', 'lower-alpha'],
	figure: ['wide', 'narrow-left', 'narrow-center', 'narrow-right', 'flush', 'full-bleed'],
	descriptive_listing: [
		'narrow-left',
		'narrow-center',
		'narrow-right',
		'full-width',
		'two-columns'
	],
	accordion: ['narrow-left', 'narrow-center', 'narrow-right', 'full-width', 'two-columns'],
	feature: ['image-right', 'image-left'],
	gallery: ['mixed', 'portraits', 'squares', 'landscapes', 'compact-landscapes'],
	descriptive_gallery: ['cards', 'compact'],
	nav_button: ['primary', 'secondary'],
	button: ['primary', 'secondary']
};

export default {
	up({ db }) {
		const document_rows = db.prepare('SELECT document_id, data FROM documents').all();
		const update_document = db.prepare('UPDATE documents SET data = ? WHERE document_id = ?');

		for (const row of document_rows) {
			const doc = JSON.parse(row.data);
			let did_change = false;

			for (const node of Object.values(doc?.nodes ?? {})) {
				if (!Number.isInteger(node?.layout)) continue;

				const layout_ids = LEGACY_LAYOUT_IDS[node.type];
				const layout_id = layout_ids?.[node.layout - 1];
				if (!layout_id) continue;

				node.layout = layout_id;
				did_change = true;
			}

			if (did_change) update_document.run(JSON.stringify(doc), row.document_id);
		}
	}
};
