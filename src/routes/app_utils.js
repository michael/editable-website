/**
 * Find the closest ancestor node whose type can be switched (lives in a node_array with multiple node_types).
 *
 * @param {import('svedit').Session} session - The session instance
 * @returns {{ node: object, node_array_path: (string|number)[], node_index: string|number } | null} The switchable node and its containing node_array path, or null
 */
export function get_closest_switchable_type(session) {
	if (!session.selection) return null;

	// Build a full path that includes the selected node index, so we can
	// reliably extract the ancestor node index at any level while walking up.
	// For node selections the index lives in anchor_offset, not in the path.
	// For text/property selections the path already contains all indices.
	let full_path;
	let start_path;
	if (session.selection.type === 'node') {
		// For collapsed node selections (node caret), skip
		if (session.selection.anchor_offset === session.selection.focus_offset) return null;
		// E.g. path ['p1', 'body'], anchor_offset 2 -> full_path ['p1', 'body', 2]
		full_path = [...session.selection.path, session.selection.anchor_offset];
		start_path = session.selection.path;
	} else {
		// For text/property selections, go up to the containing node_array
		// Path like ['page_1', 'body', 0, 'content', 0, 'text'] -> start at ['page_1', 'body', 0, 'content']
		full_path = session.selection.path;
		if (full_path.length > 3) {
			start_path = full_path.slice(0, -2);
		} else {
			return null;
		}
	}

	// Walk up the tree checking each node_array
	let path = start_path;
	while (path && path.length >= 2) {
		const schema = session.inspect(path);
		if (schema?.type === 'node_array' && schema.node_types?.length > 1) {
			// Extract the node index from full_path at this level
			// E.g. full_path ['p1', 'body', 2, 'content', 0, 'text']
			//       path      ['p1', 'body']
			//       -> node_index = full_path[2] = 2
			if (full_path.length > path.length) {
				const node_index = full_path[path.length];
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
 * Find the closest ancestor node whose layout can be switched (has a layout property and `node_layouts[type] > 1`).
 *
 * @param {import('svedit').Session} session - The session instance
 * @param {object} session_config - The session config (session.config), used to check node_layouts
 * @returns {{ node: object, node_array_path: (string|number)[], node_index: number } | null}
 */
export function get_closest_switchable_layout(session, session_config) {
	if (!session.selection || !session.selected_node) return null;

	// Build a full path that includes the selected node index
	let full_path;
	let start_path;
	if (session.selection.type === 'node') {
		if (session.selection.anchor_offset === session.selection.focus_offset) return null;
		full_path = [...session.selection.path, session.selection.anchor_offset];
		start_path = session.selection.path;
	} else {
		full_path = session.selection.path;
		if (full_path.length > 3) {
			start_path = full_path.slice(0, -2);
		} else {
			return null;
		}
	}

	// Walk up checking each node for a layout property
	let path = start_path;
	while (path && path.length >= 2) {
		if (full_path.length > path.length) {
			const node_index = parseInt(String(full_path[path.length]));
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
