import { get_property_default } from 'svedit';

/**
 * Build the full path (including selected node index) and the starting
 * node_array path for walking up the tree from the current selection.
 *
 * For node selections the selected node index is the lower edge of the
 * selection range. For text/property selections the path already contains all indices.
 *
 * @param {import('svedit').Session} session
 * @returns {{ full_path: (string|number)[], start_path: (string|number)[] } | null}
 */
function get_ancestor_walk_paths(session) {
	if (!session.selection) return null;

	if (session.selection.type === 'node') {
		const start = Math.min(session.selection.anchor_offset, session.selection.focus_offset);
		const end = Math.max(session.selection.anchor_offset, session.selection.focus_offset);

		// Only walk from a single selected node. Multi-node selections do not
		// identify one unambiguous node whose type/layout should change.
		if (end - start !== 1) return null;

		return {
			full_path: [...session.selection.path, start],
			start_path: session.selection.path
		};
	}

	// For text/property selections, go up to the containing node_array
	// Path like ['page_1', 'body', 0, 'content', 0, 'text'] -> start at ['page_1', 'body', 0, 'content']
	if (session.selection.path.length > 3) {
		return {
			full_path: session.selection.path,
			start_path: session.selection.path.slice(0, -2)
		};
	}

	return null;
}

/**
 * Extract the numeric node index from full_path at the given ancestor level.
 *
 * @param {(string|number)[]} full_path
 * @param {(string|number)[]} ancestor_path
 * @returns {number | null}
 */
function get_node_index_at(full_path, ancestor_path) {
	if (full_path.length <= ancestor_path.length) return null;
	return parseInt(String(full_path[ancestor_path.length]));
}



/**
 * Compare schema/value objects deeply. Object key order is ignored, array order is not.
 *
 * @param {any} left
 * @param {any} right
 * @returns {boolean}
 */
function are_values_equal(left, right) {
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
 *
 * @param {any} value
 * @returns {boolean}
 */
function is_empty_literal(value) {
	if (value === undefined || value === null || value === '') return true;
	if (Array.isArray(value)) return value.length === 0;
	return false;
}

/**
 * Check if a property value is empty/default, recursing through child nodes.
 *
 * @param {import('svedit').Session} session
 * @param {object} property_definition
 * @param {any} value
 * @returns {boolean}
 */
function is_property_value_empty(session, property_definition, value) {
	if (property_definition.type === 'node') {
		if (is_empty_literal(value)) return true;
		const child_node = session.get(value);
		return child_node ? is_node_subtree_empty(session, child_node) : false;
	}

	if (property_definition.type === 'node_array') {
		if (!Array.isArray(value)) return false;
		return value.every((node_id) => {
			const child_node = session.get(node_id);
			return child_node ? is_node_subtree_empty(session, child_node) : false;
		});
	}

	const property_default = get_property_default(property_definition);
	return are_values_equal(value, property_default) || is_empty_literal(value);
}

/**
 * Check whether a node and all descendants contain only empty/default values.
 *
 * @param {import('svedit').Session} session
 * @param {object} node
 * @returns {boolean}
 */
export function is_node_subtree_empty(session, node) {
	const node_schema = session.schema[node.type];
	if (!node_schema) return false;

	for (const [property_name, property_definition] of Object.entries(node_schema.properties)) {
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
 *
 * @param {object} schema
 * @param {string} source_type
 * @param {string} target_type
 * @returns {boolean}
 */
function have_same_property_schema(schema, source_type, target_type) {
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
 *
 * @param {import('svedit').Session} session - The session instance
 * @returns {{ node: object, node_array_path: (string|number)[], node_index: number } | null}
 */
export function get_closest_switchable_type(session) {
	const paths = get_ancestor_walk_paths(session);
	if (!paths) return null;

	const { full_path, start_path } = paths;

	// Walk up the tree checking each node_array
	let path = start_path;
	while (path && path.length >= 2) {
		const schema = session.inspect(path);
		if (schema?.type === 'node_array' && schema.node_types?.length > 1) {
			// Extract the node index from full_path at this level
			// E.g. full_path ['p1', 'body', 2, 'content', 0, 'text']
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
 *
 * @param {import('svedit').Session} session - The session instance
 * @returns {{ node: object, node_array_path: (string|number)[], node_index: number, available_types: string[] } | null}
 */
export function get_cycle_node_state(session) {
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
		: cycle_ordered_types.filter((node_type) =>
				have_same_property_schema(session.schema, node.type, node_type)
			);

	return { ...closest_switchable_type, available_types };
}

/**
 * Get the colorset node for the current selection.
 * A colorset node is a node that has a `colorset` property.
 * Walks up the tree to find the nearest ancestor with colorset.
 *
 * @param {import('svedit').Session} session - The session instance
 * @returns {object|null} The colorset node or null if none found
 */
export function get_colorset_node(session) {
	if (!session.selected_node) return null;

	// Check if the selected node has colorset
	if ('colorset' in session.selected_node) {
		return session.selected_node;
	}

	// Walk up the tree based on selection type
	let path;
	if (session.selection.type === 'node') {
		// For node selection, parent is path minus last segment
		path = session.selection.path.slice(0, -1);
	} else {
		// For text or property selection, parent node is path minus last 3 segments
		path = session.selection.path.slice(0, -3);
	}

	// Walk up the tree looking for a node with colorset
	while (path && path.length > 0) {
		const node = session.get(path);
		if (node && 'colorset' in node) {
			return node;
		}
		// Move up: remove last two segments (property name and node id)
		path = path.slice(0, -2);
	}

	return null;
}

/**
 * Find the closest ancestor node whose layout can be switched
 * (has a layout property and `node_layouts[type] > 1`).
 *
 * @param {import('svedit').Session} session - The session instance
 * @param {object} session_config - The session config (session.config), used to check node_layouts
 * @returns {{ node: object, node_array_path: (string|number)[], node_index: number } | null}
 */
export function get_closest_switchable_layout(session, session_config) {
	const paths = get_ancestor_walk_paths(session);
	if (!paths) return null;

	const { full_path, start_path } = paths;

	// Walk up checking each node for a switchable layout property
	let path = start_path;
	while (path && path.length >= 2) {
		const node_index = get_node_index_at(full_path, path);
		if (node_index !== null) {
			const node = session.get([...path, node_index]);
			if (node?.layout && session_config.node_layouts?.[node.type] > 1) {
				return { node, node_array_path: path, node_index };
			}
		}
		// Move up two segments (node index + property name)
		path = path.slice(0, -2);
	}

	return null;
}
