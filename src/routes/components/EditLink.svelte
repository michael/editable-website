<script>
	import { getContext } from 'svelte';
	import { serialize_path } from 'svedit';
	import { get_page_browser } from './page_browser_context.svelte.js';

	const svedit = getContext('svedit');
	const app = getContext('app');
	const page_browser = get_page_browser();

	let { path } = $props();

	let edit_link_command = $derived(svedit.session.commands?.edit_link);
	let target_node = $derived(get_target_node());

	function get_target_node() {
		const selected_node = svedit.session.selected_node;
		if (selected_node && 'href' in selected_node) return selected_node;

		const active_link = svedit.session.active_mark;
		if (active_link?.node.type === 'link') return active_link.node;

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
	class="edit-link-dialog absolute z-40 m-0 mt-1 max-h-90 overflow-visible border border-(--border) bg-(--background) p-0 text-(--foreground) shadow-xl"
	style="position-anchor: --{serialize_path(
		path
	)}; position-area: block-end span-all; justify-self: anchor-center;"
	onclick={handle_backdrop_click}
>
	<div class="flex flex-col">
		<div class="px-1 pt-1">
			<div class="flex items-stretch">
				<input
					id="edit-link-url-input"
					bind:this={href_input_ref}
					type="url"
					bind:value={href_input_value}
					placeholder="https://example.com"
					class="edit-link-input w-72 min-w-0 flex-1 border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) focus:border-(--svedit-editing-stroke) focus:shadow-none focus:ring-0 focus:outline-none"
					onkeydown={handle_keydown}
				/>
				{#if app.has_backend}
					<button
						type="button"
						class="shrink-0 cursor-pointer border border-(--border) border-l-transparent px-3 text-(--svedit-editing-stroke) hover:bg-(--muted) focus:border-(--svedit-editing-stroke) focus:shadow-none focus:ring-0 focus:outline-none"
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
						<svg
							class="size-4"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 15 15"
							fill="none"
							aria-hidden="true"
						>
							<rect x="1.5" y="1.5" width="5" height="5" rx="0.5" stroke="currentColor" />
							<rect x="8.5" y="1.5" width="5" height="5" rx="0.5" stroke="currentColor" />
							<rect x="1.5" y="8.5" width="5" height="5" rx="0.5" stroke="currentColor" />
							<rect x="8.5" y="8.5" width="5" height="5" rx="0.5" stroke="currentColor" />
						</svg>
					</button>
				{/if}
			</div>
		</div>
		<div class="flex items-center justify-between px-3 py-2">
			<label class="flex cursor-pointer items-center gap-2">
				<input
					type="checkbox"
					bind:checked={open_in_new_tab}
					class="h-4 w-4 cursor-pointer text-(--svedit-editing-stroke) ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
				/>
				<span class="text-sm text-(--foreground)">Open in new tab</span>
			</label>
			<button
				type="button"
				class="shrink-0 cursor-pointer text-sm text-(--svedit-editing-stroke) outline-1 outline-transparent hover:opacity-80 focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
				onclick={save}
			>
				UPDATE
			</button>
		</div>
	</div>
</dialog>

<style>
	.edit-link-input {
		font-size: 16px !important;
	}

	.edit-link-dialog::backdrop {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
	}
</style>
