import { createContext } from 'svelte';

export const [get_body_node_selector, set_body_node_selector] = createContext();

export function create_body_node_selector() {
	const state = $state({
		active: false,
		on_select_node: null,
		hovered_node_id: null
	});

	function reset() {
		state.active = false;
		state.on_select_node = null;
		state.hovered_node_id = null;
	}

	function open_select(on_select_node) {
		state.active = true;
		state.on_select_node = on_select_node;
		state.hovered_node_id = null;
	}

	function close() {
		reset();
	}

	function handle_node_selected(node) {
		const on_select_node = state.on_select_node;
		reset();
		on_select_node?.(node);
	}

	function set_hovered_node(node_id) {
		state.hovered_node_id = node_id;
	}

	return {
		get state() {
			return state;
		},
		open_select,
		close,
		handle_node_selected,
		set_hovered_node
	};
}
