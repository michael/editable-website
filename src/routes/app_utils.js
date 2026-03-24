/**
 * Build the full path (including selected node index) and the starting
 * node_array path for walking up the tree from the current selection.
 *
 * For node selections the index lives in anchor_offset, not in the path.
 * For text/property selections the path already contains all indices.
 *
 * @param {import('svedit').Session} session
 * @returns {{ full_path: (string|number)[], start_path: (string|number)[] } | null}
 */
function get_ancestor_walk_paths(session) {
	if (!session.selection) return null;

	if (session.selection.type === 'node') {
		// For collapsed node selections (node caret), skip
		if (session.selection.anchor_offset === session.selection.focus_offset) return null;
		// E.g. path ['p1', 'body'], anchor_offset 2 -> full_path ['p1', 'body', 2]
		return {
			full_path: [...session.selection.path, session.selection.anchor_offset],
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
