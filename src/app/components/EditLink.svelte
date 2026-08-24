<script lang="ts">
	import { get_svedit_context } from '#app/svedit_context.js';
	import { get_app_context } from '#app/app_context.js';
	import type { DocumentPath } from 'svedit';
	import { serialize_path } from 'svedit';
	import { get_page_browser } from '#app/page_browser_context.svelte.js';

	const svedit = get_svedit_context();
	const app = get_app_context();
	const page_browser = get_page_browser();

	let { path }: { path?: DocumentPath } = $props();

	let edit_link_command = $derived(svedit.session.commands?.edit_link);
	let toggle_link_command = $derived(svedit.session.commands?.toggle_link);
	let is_creating = $derived(toggle_link_command?.show_prompt === true);
	let is_open = $derived(
		edit_link_command?.show_prompt === true || toggle_link_command?.show_prompt === true
	);
	let anchor_name = $derived(path ? `--${serialize_path(path)}` : '--selection-highlight');
	let target_node = $derived(get_target_node());
	let is_new_link = $derived(is_creating || !target_node?.href);

	function get_target_node() {
		const selected_node = svedit.session.selected_node;
		if (selected_node && 'href' in selected_node) return selected_node;

		const active_link = svedit.session.active_mark;
		if (active_link?.node.type === 'link') return active_link.node;

		return null;
	}
	let href_input_value = $state('');
	let open_in_new_tab = $state(false);
	let href_input_ref = $state<HTMLInputElement>();
	let dialog_ref = $state<HTMLDialogElement>();

	function save() {
		if (is_creating) {
			if (href_input_value) {
				svedit.session.apply(
					svedit.session.tr.toggle_mark('link', {
						href: href_input_value,
						target: open_in_new_tab ? '_blank' : '_self'
					})
				);
			}
		} else if (target_node && 'href' in target_node) {
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
		if (toggle_link_command) {
			toggle_link_command.show_prompt = false;
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
		if (is_open && dialog_ref) {
			href_input_value = is_creating ? 'https://' : target_node?.href || '';
			open_in_new_tab = is_creating ? false : target_node?.target === '_blank';

			if (!dialog_ref.open) {
				dialog_ref.showModal();
			}

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
	class="edit-link-dialog absolute z-40 m-0 mt-3 max-h-90 overflow-hidden rounded-[23px] border border-(--border) bg-(--background) p-0 text-(--foreground) shadow-[0_1px_2px_rgb(0_0_0/0.12),0_4px_16px_rgb(0_0_0/0.08)]"
	style="position-anchor: {anchor_name}; position-area: block-end span-all; justify-self: anchor-center;"
	onclick={handle_backdrop_click}
>
	<div class="flex flex-col">
		<div class="px-1 pt-1">
			<div
				class="flex items-center overflow-hidden rounded-full border border-(--border) focus-within:border-(--editing)"
			>
				<input
					id="edit-link-url-input"
					bind:this={href_input_ref}
					type="url"
					bind:value={href_input_value}
					placeholder="https://example.com"
					class="edit-link-input w-72 min-w-0 flex-1 border-0 bg-(--background) px-3 py-2 text-sm text-(--foreground) focus:shadow-none focus:ring-0 focus:outline-none"
					onkeydown={handle_keydown}
				/>
				{#if app.has_backend}
					<button
						type="button"
						class="mr-0.5 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-(--foreground) outline-none transition-all duration-150 hover:bg-(--muted) focus-visible:shadow-[inset_0_0_0_1px_var(--editing)] active:translate-y-px active:scale-95 active:bg-(--muted)"
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
							class="size-6"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<rect x="4.5" y="4.5" width="6" height="6" rx="1" stroke="currentColor" />
							<rect x="13.5" y="4.5" width="6" height="6" rx="1" stroke="currentColor" />
							<rect x="4.5" y="13.5" width="6" height="6" rx="1" stroke="currentColor" />
							<rect x="13.5" y="13.5" width="6" height="6" rx="1" stroke="currentColor" />
						</svg>
					</button>
				{/if}
			</div>
		</div>
		<div class="flex items-center justify-between p-1 pl-4">
			<label class="flex cursor-pointer items-center gap-2">
				<input
					type="checkbox"
					bind:checked={open_in_new_tab}
					class="h-4 w-4 cursor-pointer rounded-full border-(--border)! bg-(--muted)! text-(--editing) ring-0 checked:border-transparent! checked:bg-(--editing)! focus:ring-0 focus:ring-offset-0 focus:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--editing)"
				/>
				<span class="text-sm text-(--foreground)">Open in new tab</span>
			</label>
			<button
				type="button"
				class="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent px-3 text-sm font-medium text-(--editing) outline-1 outline-transparent hover:bg-(--editing-muted) focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--editing)"
				onclick={save}
			>
				{is_new_link ? 'Create' : 'Update'}
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
