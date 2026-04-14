import { createContext } from 'svelte';

export const [get_page_browser, set_page_browser] = createContext();

/**
 * @param {{ goto: (href: string) => Promise<void> | void, is_admin: () => boolean }} options
 */
export function create_page_browser(options) {
	const { goto, is_admin } = options;

	const state = $state({
		open: false,
		mode: 'navigate',
		on_select_page: null
	});

	function reset() {
		state.open = false;
		state.mode = 'navigate';
		state.on_select_page = null;
	}

	function open_navigate() {
		if (!is_admin()) return;
		state.mode = 'navigate';
		state.on_select_page = null;
		state.open = true;
	}

	function open_select(on_select_page) {
		if (!is_admin()) return;
		state.mode = 'select';
		state.on_select_page = on_select_page;
		state.open = true;
	}

	function close() {
		reset();
	}

	function handle_page_selected(page) {
		if (state.mode === 'select' && state.on_select_page) {
			state.on_select_page(page);
			reset();
			return;
		}

		reset();
		if (page?.page_href) {
			void goto(page.page_href);
		}
	}

	async function handle_page_deleted(document_id, home_page_id, current_document_id) {
		if (current_document_id !== document_id) return;

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
		handle_page_deleted
	};
}