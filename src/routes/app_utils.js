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
 * Get the layout node for the current selection.
 * A layout node is a node that has a `layout` property.
 *
 * @param {import('svedit').Session} session - The session instance
 * @returns {object|null} The layout node or null if none found
 */
export function get_layout_node(session) {
	if (!session.selected_node) return null;

	// The selected node already is a layout node
	if (session.selected_node.layout) {
		return session.selected_node;
	}

	// We resolve the parent node if available, and return it if it's a layout node.
	// NOTE: We only support one level atm, we may want to implement this recursively
	if (session.selection.type === 'node') {
		const parent_node = session.get(session.selection.path.slice(0, -1));
		return parent_node.layout ? parent_node : null;
	} else {
		// We are either in a text or property (=custom) selection
		const parent_node_path = session.selection?.path?.slice(0, -3);
		if (!parent_node_path) return null;
		const parent_node = session.get(parent_node_path);
		return parent_node.layout ? parent_node : null;
	}
}
