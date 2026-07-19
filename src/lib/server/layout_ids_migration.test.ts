import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import migration from './migrations/20260715T120000000Z_editable_use_layout_ids.js';

describe('layout id migration', () => {
	it('maps numeric layouts by node type and preserves string layouts', () => {
		const db = new DatabaseSync(':memory:');
		db.exec('CREATE TABLE documents (document_id TEXT PRIMARY KEY, data TEXT)');

		const doc = {
			document_id: 'page_1',
			nodes: {
				prose: { id: 'prose', type: 'prose', layout: 6 },
				list: { id: 'list', type: 'list', layout: 3 },
				feature: { id: 'feature', type: 'feature', layout: 2 },
				button: { id: 'button', type: 'button', layout: 'secondary' },
				unknown: { id: 'unknown', type: 'custom', layout: 2 }
			}
		};
		db.prepare('INSERT INTO documents (document_id, data) VALUES (?, ?)').run(
			doc.document_id,
			JSON.stringify(doc)
		);

		migration.up({ db });

		const migrated_doc = JSON.parse(
			String(
				db.prepare('SELECT data FROM documents WHERE document_id = ?').get(doc.document_id).data
			)
		);
		expect(migrated_doc.nodes.prose.layout).toBe('wide-centered-text');
		expect(migrated_doc.nodes.list.layout).toBe('decimal');
		expect(migrated_doc.nodes.feature.layout).toBe('image-left');
		expect(migrated_doc.nodes.button.layout).toBe('secondary');
		expect(migrated_doc.nodes.unknown.layout).toBe(2);
	});
});
