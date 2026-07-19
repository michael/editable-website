import { document_schema } from '$lib/document_schema.js';
import type { Attachment, DocumentNode, NodeSchema, PropertyDefinition } from 'svedit';

function get_attached_ranges(
	value: { marks?: Attachment[]; annotations?: Attachment[] } | null | undefined
): Attachment[] {
	return [...(value?.marks ?? []), ...(value?.annotations ?? [])];
}

/**
 * Collect all node ids reachable from a root node by walking node/node_array
 * properties and mark/annotation references, preserving first-seen traversal order.
 */
export function collect_node_ids_in_order(
	root_id: string,
	nodes: Record<string, DocumentNode>,
	exclude_roots?: Set<string>
): string[] {
	const collected: string[] = [];
	const seen_ids = new Set<string>();
	const stack: string[] = [root_id];

	while (stack.length > 0) {
		const id = stack.pop();
		if (!id || seen_ids.has(id)) continue;
		if (exclude_roots && exclude_roots.has(id) && id !== root_id) continue;

		seen_ids.add(id);
		collected.push(id);

		const node = nodes[id];
		if (!node) continue;

		const type_schema: NodeSchema | undefined = document_schema[node.type];
		if (!type_schema) continue;

		const next_ids: string[] = [];

		for (const [prop_name, prop_def] of Object.entries<PropertyDefinition>(
			type_schema.properties
		)) {
			const value = node[prop_name];
			if (value == null) continue;

			if (prop_def.type === 'node' && typeof value === 'string') {
				next_ids.push(value);
			} else if (prop_def.type === 'node_array') {
				for (const child_id of value.nodes) {
					next_ids.push(child_id);
				}
				for (const range of get_attached_ranges(value)) {
					if (range.node_id) {
						next_ids.push(range.node_id);
					}
				}
			} else if (prop_def.type === 'text') {
				for (const range of get_attached_ranges(value)) {
					if (range.node_id) {
						next_ids.push(range.node_id);
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
