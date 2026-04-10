import { createContext } from 'svelte';

export const [get_page_browser, set_page_browser] = createContext();

/**
 * @param {{ goto: (href: string) => Promise<void> | void }} options
 */
export function create_page_browser(options) {
	const { goto } = options;

	const state = $state({
		open: false,
		mode: 'navigate',
		on_select_page: null,
		current_page_id: null
	});

	function reset() {
		state.open = false;
		state.mode = 'navigate';
		state.on_select_page = null;
	}

	function open_navigate() {
		state.mode = 'navigate';
		state.on_select_page = null;
		state.open = true;
	}

	function open_select(on_select_page) {
		state.mode = 'select';
		state.on_select_page = on_select_page;
		state.open = true;
	}

	function close() {
		reset();
	}

	function handle_page_selected(document_id) {
		if (state.mode === 'select' && state.on_select_page) {
			state.on_select_page(document_id);
			reset();
			return;
		}

		reset();
		void goto(`/${document_id}`);
	}

	function set_current_page(document_id) {
		state.current_page_id = document_id ?? null;
	}

	async function handle_page_deleted(document_id, home_page_id) {
		if (state.current_page_id !== document_id) return;

		reset();
		if (home_page_id) {
			await goto('/');
		}
	}

	return {
		get state() {
			return state;
		},
		open_navigate,
		open_select,
		close,
		handle_page_selected,
		set_current_page,
		handle_page_deleted
	};
}