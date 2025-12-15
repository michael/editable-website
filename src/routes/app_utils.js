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
