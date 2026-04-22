import { document_schema } from '$lib/document_schema.js';

/**
 * Collect all node ids reachable from a root node by walking node/node_array
 * properties and annotation references, preserving first-seen traversal order.
 *
 * @param {string} root_id
 * @param {Record<string, any>} nodes
 * @param {Set<string>} [exclude_roots]
 * @returns {string[]}
 */
export function collect_node_ids_in_order(root_id, nodes, exclude_roots) {
	const collected = [];
	const seen_ids = new Set();
	const stack = [root_id];

	while (stack.length > 0) {
		const id = stack.pop();
		if (!id || seen_ids.has(id)) continue;
		if (exclude_roots && exclude_roots.has(id) && id !== root_id) continue;

		seen_ids.add(id);
		collected.push(id);

		const node = nodes[id];
		if (!node) continue;

		const type_schema = document_schema[node.type];
		if (!type_schema) continue;

		const next_ids = [];

		for (const [prop_name, prop_def] of Object.entries(type_schema.properties)) {
			const value = node[prop_name];
			if (value == null) continue;

			if (prop_def.type === 'node' && typeof value === 'string') {
				next_ids.push(value);
			} else if (prop_def.type === 'node_array' && Array.isArray(value)) {
				for (const child_id of value) {
					next_ids.push(child_id);
				}
			} else if (prop_def.type === 'annotated_text' && value.annotations) {
				for (const annotation of value.annotations) {
					if (annotation.node_id) {
						next_ids.push(annotation.node_id);
					}
				}
			}
		}

		for (let i = next_ids.length - 1; i >= 0; i -= 1) {
			stack.push(next_ids[i]);
		}
	}

	return collected;
}