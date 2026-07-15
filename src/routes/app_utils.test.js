import { describe, expect, it } from 'vitest';
import { get_selection_node_ancestors } from './app_utils.js';

describe('get_selection_node_ancestors', () => {
	it('finds nodes reached through both node properties and node arrays', () => {
		const values = new Map([
			[JSON.stringify(['page_1']), { id: 'page_1', type: 'page' }],
			[JSON.stringify(['page_1', 'nav']), { id: 'nav_1', type: 'nav' }],
			[JSON.stringify(['page_1', 'nav', 'start_items']), { nodes: ['nav_link_1'] }],
			[JSON.stringify(['page_1', 'nav', 'start_items', 0]), { id: 'nav_link_1', type: 'nav_link' }]
		]);
		const session = /** @type {import('svedit').Session} */ (
			/** @type {unknown} */ ({
				selection: {
					type: 'node',
					path: ['page_1', 'nav', 'start_items'],
					anchor_offset: 0,
					focus_offset: 1
				},
				schema: {
					page: { kind: 'document' },
					nav: { kind: 'block' },
					nav_link: { kind: 'block' }
				},
				get(path) {
					return values.get(JSON.stringify(path));
				}
			})
		);

		expect(get_selection_node_ancestors(session)).toEqual([
			{ node: { id: 'nav_1', type: 'nav' }, path: ['page_1', 'nav'] },
			{
				node: { id: 'nav_link_1', type: 'nav_link' },
				path: ['page_1', 'nav', 'start_items', 0]
			}
		]);
	});
});
