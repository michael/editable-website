import { createContext } from 'svelte';

export type PageDeleteTarget = {
	document_id: string;
	/** Page title, shown in the confirmation copy. */
	title: string;
	/**
	 * True when the target is the page currently open. Deleting it navigates
	 * home, since staying would leave the browser on a dead URL.
	 */
	is_current_page: boolean;
	/** Caller-specific cleanup after a successful delete, on top of the shared refresh. */
	on_deleted?: (() => void) | null;
};

export type PageDeleteDialog = ReturnType<typeof create_page_delete_dialog>;

export const [get_page_delete_dialog, set_page_delete_dialog] = createContext<PageDeleteDialog>();

/**
 * Shared state for the delete confirmation, which is rendered once by Overlays
 * and opened from both the page browser ellipsis menu and the toolbar
 * page-actions menu.
 */
export function create_page_delete_dialog() {
	const state = $state({
		target: null as PageDeleteTarget | null
	});

	function open(target: PageDeleteTarget) {
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
