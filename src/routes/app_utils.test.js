import { describe, expect, it } from 'vitest';
import {
	get_closest_switchable_layout,
	get_cycle_node_state,
	get_selection_node_ancestors
} from './app_utils.js';

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

	it('resolves the owning parent from a collapsed node gap', () => {
		const page = { id: 'page_1', type: 'page' };
		const prose = {
			id: 'prose_1',
			type: 'prose',
			layout: 'narrow-left'
		};
		const values = new Map(
			/** @type {[string, any][]} */ ([
				[JSON.stringify(['page_1']), page],
				[JSON.stringify(['page_1', 'body']), { nodes: ['prose_1'] }],
				[JSON.stringify(['page_1', 'body', 0]), prose]
			])
		);
		const session = /** @type {import('svedit').Session} */ (
			/** @type {unknown} */ ({
				selection: {
					type: 'node',
					path: ['page_1', 'body', 0, 'body'],
					anchor_offset: 0,
					focus_offset: 0
				},
				schema: {
					page: { kind: 'document', properties: {} },
					prose: {
						kind: 'block',
						properties: { layout: { type: 'string', default: 'narrow-left' } }
					},
					figure: { kind: 'block', properties: {} }
				},
				config: {
					node_layouts: { prose: ['narrow-left', 'narrow-center'] }
				},
				get(path) {
					return values.get(JSON.stringify(path));
				},
				inspect(path) {
					if (JSON.stringify(path) === JSON.stringify(['page_1', 'body'])) {
						return { type: 'node_array', node_types: ['prose', 'figure'] };
					}
					return null;
				}
			})
		);

		expect(get_selection_node_ancestors(session)).toEqual([
			{ node: page, path: ['page_1'] },
			{ node: prose, path: ['page_1', 'body', 0] }
		]);
		expect(get_cycle_node_state(session)).toMatchObject({
			node: prose,
			node_array_path: ['page_1', 'body'],
			node_index: 0,
			available_types: ['figure']
		});
		expect(get_closest_switchable_layout(session, session.config)).toMatchObject({
			node: prose,
			node_array_path: ['page_1', 'body'],
			node_index: 0
		});

		session.selection = {
			type: 'node',
			path: ['page_1', 'body'],
			anchor_offset: 0,
			focus_offset: 0
		};
		expect(get_selection_node_ancestors(session)).toEqual([{ node: page, path: ['page_1'] }]);
	});
});
