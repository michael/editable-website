import { createContext } from 'svelte';

export type PageUrlTarget = {
	document_id: string;
	/** Active page href, e.g. `/about`. Prefills the input; null for an unsaved page. */
	page_href: string | null;
	/** Caller-specific cleanup after a successful save, on top of the shared refresh. */
	on_saved?: (() => void) | null;
};

export type PageUrlDialog = ReturnType<typeof create_page_url_dialog>;

export const [get_page_url_dialog, set_page_url_dialog] = createContext<PageUrlDialog>();

/**
 * Shared state for the Edit URL dialog, which is rendered once by Overlays and
 * opened from both the page browser ellipsis menu and the toolbar page-actions
 * menu.
 */
export function create_page_url_dialog() {
	const state = $state({
		target: null as PageUrlTarget | null
	});

	function open(target: PageUrlTarget) {
		state.target = target;
	}

	function close() {
		state.target = null;
	}

	return {
		get state() {
			return state;
		},
		open,
		close
	};
}
