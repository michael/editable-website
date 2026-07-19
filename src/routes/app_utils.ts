import { get_property_default } from 'svedit';
import type { Session, DocumentNode, DocumentPath, PropertyDefinition } from 'svedit';

/**
 * Build the full path (including selected node index) and the starting
 * node_array path for walking up the tree from the current selection.
 *
 * For node selections the selected node index is the lower edge of a single-node
 * range. A collapsed node selection points at the node that owns the selected gap.
 * For text/property selections the path already contains all indices.
 */
function get_ancestor_walk_paths(
	session: Session
): { full_path: DocumentPath; start_path: DocumentPath } | null {
	if (!session.selection) return null;

	if (session.selection.type === 'node') {
		const start = Math.min(session.selection.anchor_offset, session.selection.focus_offset);
		const end = Math.max(session.selection.anchor_offset, session.selection.focus_offset);
		if (end === start) {
			const owner_path = session.selection.path.slice(0, -1);
			if (owner_path.length === 0) return null;
			return {
				full_path: owner_path,
				start_path: session.selection.path.slice(0, -2)
			};
		}

		// Only walk from a single selected node. Multi-node selections do not
		// identify one unambiguous node whose type/layout should change.
		if (end - start !== 1) return null;

		return {
			full_path: [...session.selection.path, start],
			start_path: session.selection.path
		};
	}

	// For text/property selections, go up to the containing node_array
	// Path like ['page_1', 'body', 0, 'body', 0, 'text'] -> start at ['page_1', 'body', 0, 'body']
	if (session.selection.path.length > 3) {
		return {
			full_path: session.selection.path,
			start_path: session.selection.path.slice(0, -2)
		};
	}

	return null;
}

/**
 * Return the nodes between the document root and the current canonical selection.
 * The document node itself is normally omitted because it is editor infrastructure.
 * It is retained as the owning-node fallback for a collapsed top-level node gap.
 */
export function get_selection_node_ancestors(
	session: Session
): { node: DocumentNode; path: DocumentPath }[] {
	const paths = get_ancestor_walk_paths(session);
	if (!paths) return [];
	const include_document =
		session.selection?.type === 'node' &&
		session.selection.anchor_offset === session.selection.focus_offset;

	const ancestors: { node: DocumentNode; path: DocumentPath }[] = [];
	for (let path_length = 1; path_length <= paths.full_path.length; path_length += 1) {
		const path = paths.full_path.slice(0, path_length);
		const node = session.get(path);
		if (!node || typeof node.type !== 'string' || !session.schema[node.type]) continue;
		if (session.schema[node.type].kind === 'document' && !include_document) continue;
		ancestors.push({ node, path });
	}

	return ancestors;
}

/**
 * Extract the numeric node index from full_path at the given ancestor level.
 */
function get_node_index_at(full_path: DocumentPath, ancestor_path: DocumentPath): number | null {
	if (full_path.length <= ancestor_path.length) return null;
	return parseInt(String(full_path[ancestor_path.length]));
}

/**
 * Compare schema/value objects deeply. Object key order is ignored, array order is not.
 */
function are_values_equal(left: any, right: any): boolean {
	if (Object.is(left, right)) return true;
	if (typeof left !== typeof right) return false;
	if (left === null || right === null) return false;

	if (Array.isArray(left) || Array.isArray(right)) {
		if (!Array.isArray(left) || !Array.isArray(right)) return false;
		if (left.length !== right.length) return false;
		return left.every((value, index) => are_values_equal(value, right[index]));
	}

	if (typeof left === 'object') {
		const left_keys = Object.keys(left);
		const right_keys = Object.keys(right);
		if (left_keys.length !== right_keys.length) return false;
		return left_keys.every(
			(key) => Object.hasOwn(right, key) && are_values_equal(left[key], right[key])
		);
	}

	return false;
}

/**
 * Check if a primitive or custom extra value is empty without schema context.
 */
function is_empty_literal(value: any): boolean {
	if (value === undefined || value === null || value === '') return true;
	if (Array.isArray(value)) return value.length === 0;
	return false;
}

/**
 * Check if a property value is empty/default, recursing through child nodes.
 */
function is_property_value_empty(
	session: Session,
	property_definition: PropertyDefinition,
	value: any
): boolean {
	if (property_definition.type === 'node') {
		if (is_empty_literal(value)) return true;
		const child_node = session.get(value);
		return child_node ? is_node_subtree_empty(session, child_node) : false;
	}

	if (property_definition.type === 'node_array') {
		if (!value?.nodes) return false;
		return value.nodes.every((node_id: string) => {
			const child_node = session.get(node_id);
			return child_node ? is_node_subtree_empty(session, child_node) : false;
		});
	}

	const property_default = get_property_default(property_definition);
	return are_values_equal(value, property_default) || is_empty_literal(value);
}

/**
 * Check whether a node and all descendants contain only empty/default values.
 */
export function is_node_subtree_empty(session: Session, node: DocumentNode): boolean {
	const node_schema = session.schema[node.type];
	if (!node_schema) return false;

	for (const [property_name, property_definition] of Object.entries<PropertyDefinition>(
		node_schema.properties
	)) {
		if (property_name === 'layout') continue;
		if (!is_property_value_empty(session, property_definition, node[property_name])) return false;
	}

	for (const property_name of Object.keys(node)) {
		if (property_name === 'id' || property_name === 'type') continue;
		if (Object.hasOwn(node_schema.properties, property_name)) continue;
		if (!is_empty_literal(node[property_name])) return false;
	}

	return true;
}

/**
 * Check whether two node types have exactly equivalent property schemas.
 */
function have_same_property_schema(
	schema: Record<string, any>,
	source_type: string,
	target_type: string
): boolean {
	const source_properties = schema[source_type]?.properties;
	const target_properties = schema[target_type]?.properties;
	return (
		!!source_properties &&
		!!target_properties &&
		are_values_equal(source_properties, target_properties)
	);
}

/**
 * Find the closest ancestor node whose type can be switched
 * (lives in a node_array with multiple node_types).
 */
export function get_closest_switchable_type(
	session: Session
): { node: DocumentNode; node_array_path: DocumentPath; node_index: number } | null {
	const paths = get_ancestor_walk_paths(session);
	if (!paths) return null;

	const { full_path, start_path } = paths;

	// Walk up the tree checking each node_array
	let path = start_path;
	while (path && path.length >= 2) {
		const schema = session.inspect(path);
		if (schema?.type === 'node_array' && schema.node_types?.length > 1) {
			// Extract the node index from full_path at this level
			// E.g. full_path ['p1', 'body', 2, 'body', 0, 'text']
			//       path      ['p1', 'body']
			//       -> node_index = full_path[2] = 2
			const node_index = get_node_index_at(full_path, path);
			if (node_index !== null) {
				const node = session.get([...path, node_index]);
				if (node) {
					return { node, node_array_path: path, node_index };
				}
			}
		}
		// Move up two segments (node index + property name)
		path = path.slice(0, -2);
	}

	return null;
}

/**
 * Get the current cycle node state, including compatible target types.
 */
export function get_cycle_node_state(session: Session): {
	node: DocumentNode;
	node_array_path: DocumentPath;
	node_index: number;
	available_types: string[];
} | null {
	const closest_switchable_type = get_closest_switchable_type(session);
	if (!closest_switchable_type) return null;

	const { node, node_array_path } = closest_switchable_type;
	const node_array_schema = session.inspect(node_array_path);
	const node_types = node_array_schema?.node_types ?? [];
	const current_type_index = node_types.indexOf(node.type);

	if (current_type_index === -1) {
		return { ...closest_switchable_type, available_types: [] };
	}

	const cycle_ordered_types = [
		...node_types.slice(current_type_index + 1),
		...node_types.slice(0, current_type_index)
	];
	const node_is_empty = is_node_subtree_empty(session, node);
	const available_types = node_is_empty
		? cycle_ordered_types
		: cycle_ordered_types.filter((node_type: string) =>
				have_same_property_schema(session.schema, node.type, node_type)
			);

	return { ...closest_switchable_type, available_types };
}

/**
 * Find the closest ancestor node whose layout can be switched
 * (has a layout property with more than one allowed value).
 */
export function get_closest_switchable_layout(
	session: Session
): { node: DocumentNode; node_array_path: DocumentPath; node_index: number } | null {
	const paths = get_ancestor_walk_paths(session);
	if (!paths) return null;

	const { full_path, start_path } = paths;

	// Walk up checking each node for a switchable layout property
	let path = start_path;
	while (path && path.length >= 2) {
		const node_index = get_node_index_at(full_path, path);
		if (node_index !== null) {
			const node = session.get([...path, node_index]);
			const layout_property = session.schema[node?.type]?.properties?.layout;
			const layouts = layout_property?.type === 'string' ? layout_property.values : undefined;
			if (node?.layout && layouts?.length > 1) {
				return { node, node_array_path: path, node_index };
			}
		}
		// Move up two segments (node index + property name)
		path = path.slice(0, -2);
	}

	return null;
}
