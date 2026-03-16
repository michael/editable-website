import { getRequestEvent, query, command } from '$app/server';
import * as v from 'valibot';
import db from '$lib/server/db.js';
import { document_schema } from '$lib/document_schema.js';

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

		const type_schema = document_schema[node.type];
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

		const delete_refs = db.prepare('DELETE FROM asset_refs WHERE document_id = ?');
		const insert_ref = db.prepare('INSERT OR IGNORE INTO asset_refs (asset_id, document_id) VALUES (?, ?)');

		// Wrap all upserts in a transaction so either all succeed or none
		db.exec('BEGIN');
		try {
			// Save page
			upsert.run(combined_doc.document_id, 'page', JSON.stringify(page_doc));
			update_asset_refs(combined_doc.document_id, page_node_ids, all_nodes, delete_refs, insert_ref);

			// Save nav if present
			if (nav_root_id && nav_node_ids.size > 0) {
				const nav_doc = extract_document(nav_root_id, nav_node_ids, all_nodes);
				upsert.run(nav_root_id, 'nav', JSON.stringify(nav_doc));
				update_asset_refs(nav_root_id, nav_node_ids, all_nodes, delete_refs, insert_ref);
			}

			// Save footer if present
			if (footer_root_id && footer_node_ids.size > 0) {
				const footer_doc = extract_document(footer_root_id, footer_node_ids, all_nodes);
				upsert.run(footer_root_id, 'footer', JSON.stringify(footer_doc));
				update_asset_refs(footer_root_id, footer_node_ids, all_nodes, delete_refs, insert_ref);
			}

			db.exec('COMMIT');
		} catch (err) {
			db.exec('ROLLBACK');
			throw err;
		}

		return { ok: true };
	}
);

/**
 * Update asset_refs for a sub-document: full replace of all refs for the given document_id.
 * Collects src values from image nodes in the node set.
 *
 * @param {string} document_id
 * @param {Set<string>} node_ids
 * @param {Record<string, any>} all_nodes
 * @param {import('node:sqlite').StatementSync} delete_stmt
 * @param {import('node:sqlite').StatementSync} insert_stmt
 */
function update_asset_refs(document_id, node_ids, all_nodes, delete_stmt, insert_stmt) {
	// Collect asset ids from image nodes
	const asset_ids = new Set();
	for (const node_id of node_ids) {
		const node = all_nodes[node_id];
		if (node && node.type === 'image' && typeof node.src === 'string' && node.src && !node.src.startsWith('blob:')) {
			asset_ids.add(node.src);
		}
	}

	// Full replace: delete all existing refs, insert current set
	delete_stmt.run(document_id);
	for (const asset_id of asset_ids) {
		insert_stmt.run(asset_id, document_id);
	}
}
