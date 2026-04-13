<script>
	import { getContext } from 'svelte';
	import { get_page_browser } from './page_browser_context.svelte.js';

	const svedit = getContext('svedit');
	const has_backend = getContext('has_backend');
	const page_browser = get_page_browser();

	let { path } = $props();

	let edit_link_command = $derived(svedit.session.commands?.edit_link);
	let target_node = $derived(get_target_node());

	function get_target_node() {
		const selected_node = svedit.session.selected_node;
		if (selected_node && 'href' in selected_node) return selected_node;

		const active_link = svedit.session.active_annotation('link');
		if (active_link) return svedit.session.get(active_link.node_id);

		return null;
	}
	let href_input_value = $state('');
	let open_in_new_tab = $state(false);
	let href_input_ref = $state();
	let dialog_ref = $state();

	function save() {
		if (target_node && 'href' in target_node) {
			const tr = svedit.session.tr;
			tr.set([target_node.id, 'href'], href_input_value);
			tr.set([target_node.id, 'target'], open_in_new_tab ? '_blank' : '_self');
			svedit.session.apply(tr);
		}
		close();
	}

	function close() {
		if (edit_link_command) {
			edit_link_command.show_prompt = false;
		}
		svedit.focus_canvas();
	}

	function handle_keydown(event) {
		event.stopPropagation();

		if (event.key === 'Enter') {
			event.preventDefault();
			save();
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
		if (edit_link_command?.show_prompt && dialog_ref) {
			href_input_value = target_node?.href || '';
			open_in_new_tab = target_node?.target === '_blank';
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
	class="edit-link-dialog absolute z-40 mt-1 m-0 bg-(--background) text-(--foreground) p-0 shadow-xl overflow-visible max-h-90 border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)]"
	style="position-anchor: --{path.join('-')}; position-area: block-end span-all; justify-self: anchor-center;"
	onclick={handle_backdrop_click}
>
	<div class="flex flex-col">
		<div class="flex items-stretch border-b border-[color-mix(in_oklch,var(--foreground)_18%,transparent)]">
			<input
				id="edit-link-url-input"
				bind:this={href_input_ref}
				type="url"
				bind:value={href_input_value}
				placeholder="https://example.com"
				class="w-72 min-w-0 flex-1 border-0 bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none focus:ring-1 focus:ring-(--svedit-editing-stroke)"
				onkeydown={handle_keydown}
			/>
			{#if has_backend()}
				<button
					type="button"
					class="shrink-0 cursor-pointer border-l border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] px-3 text-(--svedit-editing-stroke) hover:bg-[color-mix(in_oklch,var(--foreground)_10%,var(--background))]"
					title="Select page"
					aria-label="Select page"
					onclick={() => {
						page_browser.open_select((page) => {
							href_input_value = page.page_href || '/';
							open_in_new_tab = false;
							save();
						});
					}}
				>
					<svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="none" aria-hidden="true">
						<rect x="1.5" y="1.5" width="5" height="5" rx="0.5" stroke="currentColor" />
						<rect x="8.5" y="1.5" width="5" height="5" rx="0.5" stroke="currentColor" />
						<rect x="1.5" y="8.5" width="5" height="5" rx="0.5" stroke="currentColor" />
						<rect x="8.5" y="8.5" width="5" height="5" rx="0.5" stroke="currentColor" />
					</svg>
				</button>
			{/if}
		</div>
		<div class="flex items-center justify-between px-3 py-2">
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={open_in_new_tab}
					class="w-4 h-4 cursor-pointer text-(--svedit-editing-stroke) focus:ring-(--svedit-editing-stroke)"
				/>
				<span class="text-sm text-(--foreground)">Open in new tab</span>
			</label>
			<button
				type="button"
				class="text-sm text-(--svedit-editing-stroke) cursor-pointer shrink-0 hover:opacity-80"
				onclick={save}
			>
				UPDATE
			</button>
		</div>
	</div>
</dialog>

<style>
	.edit-link-dialog::backdrop {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
	}
</style>
