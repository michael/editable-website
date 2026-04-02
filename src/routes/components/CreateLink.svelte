<script>
	import { getContext } from 'svelte';
	import { get_page_browser } from './page_browser_context.svelte.js';

	const svedit = getContext('svedit');
	const page_browser = get_page_browser();

	let toggle_link_command = $derived(svedit.session.commands?.toggle_link);
	let href_input_value = $state('https://');
	let open_in_new_tab = $state(false);
	let href_input_ref = $state();
	let dialog_ref = $state();

	function create_link() {
		if (href_input_value) {
			svedit.session.apply(
				svedit.session.tr.annotate_text('link', {
					href: href_input_value,
					target: open_in_new_tab ? '_blank' : '_self'
				})
			);
		}
		close();
	}

	function close() {
		if (toggle_link_command) {
			toggle_link_command.show_prompt = false;
		}
		svedit.focus_canvas();
		href_input_value = 'https://';
		open_in_new_tab = false;
	}

	function handle_keydown(event) {
		event.stopPropagation();

		if (event.key === 'Enter') {
			event.preventDefault();
			create_link();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}

	function handle_backdrop_click(event) {
		if (event.target === dialog_ref) {
			close();
		}
	}

	$effect(() => {
		if (toggle_link_command?.show_prompt && dialog_ref) {
			dialog_ref.showModal();

			if (href_input_ref) {
				href_input_ref.focus();
				href_input_ref.select();
			}
		} else if (dialog_ref?.open) {
			dialog_ref.close();
		}
	});
</script>

<dialog
	bind:this={dialog_ref}
	class="create-link-dialog absolute z-40 mt-1 m-0 bg-white p-0 shadow-xl overflow-visible max-h-90 border border-(--svedit-editing-stroke)"
	style="position-anchor: --selection-highlight; position-area: block-end span-all; justify-self: anchor-center;"
	onclick={handle_backdrop_click}
>
	<div class="flex flex-col">
		<div class="flex items-stretch border-b border-gray-200">
			<input
				bind:this={href_input_ref}
				type="url"
				bind:value={href_input_value}
				placeholder="https://example.com"
				class="w-72 min-w-0 flex-1 border-0 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-1 focus:ring-(--svedit-editing-stroke)"
				onkeydown={handle_keydown}
			/>
			<button
				type="button"
				class="shrink-0 cursor-pointer border-l border-gray-200 px-3 text-(--svedit-editing-stroke) hover:bg-[oklch(from_var(--svedit-brand)_0.97_0.015_h)]"
				title="Select page"
				aria-label="Select page"
				onclick={() => {
					page_browser.open_select((document_id) => {
						href_input_value = `/${document_id}`;
						open_in_new_tab = false;
						create_link();
					});
				}}
			>
				↗
			</button>
		</div>
		<div class="flex items-center justify-between px-3 py-2">
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={open_in_new_tab}
					class="w-4 h-4 cursor-pointer text-(--svedit-editing-stroke) focus:ring-(--svedit-editing-stroke)"
				/>
				<span class="text-sm text-gray-600">Open in new tab</span>
			</label>
			<button
				type="button"
				class="text-sm text-(--svedit-editing-stroke) cursor-pointer shrink-0 hover:opacity-80"
				onclick={create_link}
			>
				CREATE
			</button>
		</div>
	</div>
</dialog>

<style>
	.create-link-dialog::backdrop {
		background: rgba(0, 0, 0, 0.15);
	}
</style>
