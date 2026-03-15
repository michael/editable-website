import { getRequestEvent, query, command } from '$app/server';
import * as v from 'valibot';
import db from '$lib/server/db.js';

/**
 * @typedef {Object} DocumentRow
 * @property {string} document_id
 * @property {string} type
 * @property {string} data - JSON string containing document data
 */

/**
 * @typedef {Object} DocumentData
 * @property {string} document_id
 * @property {Record<string, any>} nodes
 */

// Minimal schema for graph walking — only need property types to follow references
const walk_schema = {
	page: {
		properties: {
			body: { type: 'node_array' },
			nav: { type: 'node' },
			footer: { type: 'node' }
		}
	},
	footer: {
		properties: {
			logo: { type: 'node' },
			copyright: { type: 'annotated_text' },
			footer_link_columns: { type: 'node_array' }
		}
	},
	footer_link_column: {
		properties: {
			label: { type: 'annotated_text' },
			footer_links: { type: 'node_array' }
		}
	},
	footer_link: {
		properties: {
			href: { type: 'string' },
			target: { type: 'string' },
			label: { type: 'annotated_text' }
		}
	},
	nav: {
		properties: {
			logo: { type: 'node' },
			nav_items: { type: 'node_array' }
		}
	},
	nav_item: {
		properties: {
			layout: { type: 'integer' },
			href: { type: 'string' },
			target: { type: 'string' },
			label: { type: 'annotated_text' }
		}
	},
	hero: {
		properties: {
			layout: { type: 'integer' },
			colorset: { type: 'integer' },
			title: { type: 'annotated_text' },
			description: { type: 'annotated_text' },
			buttons: { type: 'node_array' }
		}
	},
	button: {
		properties: {
			layout: { type: 'integer' },
			href: { type: 'string' },
			target: { type: 'string' },
			label: { type: 'annotated_text' }
		}
	},
	prose: {
		properties: {
			layout: { type: 'integer' },
			colorset: { type: 'integer' },
			content: { type: 'node_array' }
		}
	},
	text: {
		properties: {
			layout: { type: 'integer' },
			content: { type: 'annotated_text' }
		}
	},
	image: {
		properties: {
			src: { type: 'string' },
			width: { type: 'integer' },
			height: { type: 'integer' },
			alt: { type: 'string' },
			focal_point_x: { type: 'number' },
			focal_point_y: { type: 'number' },
			scale: { type: 'number' },
			object_fit: { type: 'string' }
		}
	},
	figure: {
		properties: {
			image: { type: 'node' }
		}
	},
	gallery: {
		properties: {
			layout: { type: 'integer' },
			colorset: { type: 'integer' },
			intro: { type: 'node_array' },
			gallery_items: { type: 'node_array' },
			outro: { type: 'node_array' }
		}
	},
	gallery_item: {
		properties: {
			image: { type: 'node' }
		}
	},
	link_collection: {
		properties: {
			layout: { type: 'integer' },
			colorset: { type: 'integer' },
			intro: { type: 'node_array' },
			link_collection_items: { type: 'node_array' },
			outro: { type: 'node_array' }
		}
	},
	link_collection_item: {
		properties: {
			href: { type: 'string' },
			target: { type: 'string' },
			image: { type: 'node' },
			preline: { type: 'annotated_text' },
			title: { type: 'annotated_text' },
			description: { type: 'annotated_text' }
		}
	},
	feature: {
		properties: {
			layout: { type: 'integer' },
			colorset: { type: 'integer' },
			image: { type: 'node' },
			body: { type: 'node_array' }
		}
	},
	link: {
		properties: {
			href: { type: 'string' },
			target: { type: 'string' }
		}
	},
	strong: { properties: {} },
	emphasis: { properties: {} },
	highlight: { properties: {} }
};

/**
 * Collect all node ids reachable from a root node by walking node/node_array
 * properties and annotation references.
 *
 * @param {string} root_id
 * @param {Record<string, any>} nodes
 * @param {Set<string>} [exclude_roots] - root ids whose subtrees should not be traversed
 * @returns {Set<string>}
 */
function collect_node_ids(root_id, nodes, exclude_roots) {
	const collected = new Set();
	const stack = [root_id];

	while (stack.length > 0) {
		const id = stack.pop();
		if (collected.has(id)) continue;
		if (exclude_roots && exclude_roots.has(id) && id !== root_id) continue;
		collected.add(id);

		const node = nodes[id];
		if (!node) continue;

		const type_schema = walk_schema[node.type];
		if (!type_schema) continue;

		for (const [prop_name, prop_def] of Object.entries(type_schema.properties)) {
			const value = node[prop_name];
			if (value == null) continue;

			if (prop_def.type === 'node' && typeof value === 'string') {
				stack.push(value);
			} else if (prop_def.type === 'node_array' && Array.isArray(value)) {
				for (const child_id of value) {
					stack.push(child_id);
				}
			} else if (prop_def.type === 'annotated_text' && value.annotations) {
				for (const annotation of value.annotations) {
					if (annotation.node_id) {
						stack.push(annotation.node_id);
					}
				}
			}
		}
	}

	return collected;
}

/**
 * Extract a subset of nodes into a document object.
 *
 * @param {string} document_id
 * @param {Set<string>} node_ids
 * @param {Record<string, any>} all_nodes
 * @returns {DocumentData}
 */
function extract_document(document_id, node_ids, all_nodes) {
	const nodes = {};
	for (const id of node_ids) {
		if (all_nodes[id]) {
			nodes[id] = all_nodes[id];
		}
	}
	return { document_id, nodes };
}

/**
 * Get a single document row from the database.
 *
 * @param {string} document_id
 * @returns {DocumentData}
 */
function get_doc_from_db(document_id) {
	const doc_row = /** @type {DocumentRow | undefined} */ (
		db.prepare('SELECT * FROM documents WHERE document_id = ?').get(document_id)
	);
	if (!doc_row) {
		throw new Error(`Document not found: ${document_id}`);
	}
	return JSON.parse(doc_row.data);
}

/**
 * Get a document from the database, stitching in shared documents (nav, footer).
 */
export const get_document = query(v.string(), async (document_id) => {
	const page_doc = get_doc_from_db(document_id);
	const page_node = page_doc.nodes[page_doc.document_id];

	// Start with the page nodes
	const merged_nodes = { ...page_doc.nodes };

	// Stitch in nav if referenced
	if (page_node.nav) {
		const nav_doc = get_doc_from_db(page_node.nav);
		Object.assign(merged_nodes, nav_doc.nodes);
	}

	// Stitch in footer if referenced
	if (page_node.footer) {
		const footer_doc = get_doc_from_db(page_node.footer);
		Object.assign(merged_nodes, footer_doc.nodes);
	}

	return {
		document_id: page_doc.document_id,
		nodes: merged_nodes
	};
});

/**
 * Save a document to the database, splitting shared documents (nav, footer) back out.
 */
export const save_document = command(
	v.object({
		document_id: v.string(),
		nodes: v.record(v.string(), v.any())
	}),
	async (combined_doc) => {
		const { locals } = getRequestEvent();

		// TODO: check auth once authentication is implemented
		// if (!locals.user) {
		// 	throw new Error('Unauthorized');
		// }

		const all_nodes = combined_doc.nodes;
		const page_node = all_nodes[combined_doc.document_id];

		if (!page_node) {
			throw new Error(`Root node not found: ${combined_doc.document_id}`);
		}

		const nav_root_id = page_node.nav;
		const footer_root_id = page_node.footer;

		// Collect nav and footer subtrees
		const nav_node_ids = nav_root_id
			? collect_node_ids(nav_root_id, all_nodes)
			: new Set();
		const footer_node_ids = footer_root_id
			? collect_node_ids(footer_root_id, all_nodes)
			: new Set();

		// Collect page subtree, excluding nav and footer subtrees
		const exclude_roots = new Set();
		if (nav_root_id) exclude_roots.add(nav_root_id);
		if (footer_root_id) exclude_roots.add(footer_root_id);
		const page_node_ids = collect_node_ids(combined_doc.document_id, all_nodes, exclude_roots);

		// Build the split documents
		const page_doc = extract_document(combined_doc.document_id, page_node_ids, all_nodes);

		const upsert = db.prepare(
			'INSERT INTO documents (document_id, type, data) VALUES(?, ?, ?) ON CONFLICT(document_id) DO UPDATE SET data = excluded.data'
		);

		// Save page
		upsert.run(combined_doc.document_id, 'page', JSON.stringify(page_doc));

		// Save nav if present
		if (nav_root_id && nav_node_ids.size > 0) {
			const nav_doc = extract_document(nav_root_id, nav_node_ids, all_nodes);
			upsert.run(nav_root_id, 'nav', JSON.stringify(nav_doc));
		}

		// Save footer if present
		if (footer_root_id && footer_node_ids.size > 0) {
			const footer_doc = extract_document(footer_root_id, footer_node_ids, all_nodes);
			upsert.run(footer_root_id, 'footer', JSON.stringify(footer_doc));
		}

		return { ok: true };
	}
);