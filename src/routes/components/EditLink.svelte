<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	let { path } = $props();

	let edit_link_command = $derived(svedit.session.commands?.edit_link);
	let target_node = $derived(svedit.session.selected_node);
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
		// Close if clicking on the backdrop (the dialog element itself, not its contents)
		if (event.target === dialog_ref) {
			close();
		}
	}

	$effect(() => {
		if (edit_link_command?.show_prompt && dialog_ref) {
			// Initialize with current values
			href_input_value = target_node?.href || '';
			open_in_new_tab = target_node?.target === '_blank';
			dialog_ref.showModal();

			// Focus and select input after dialog opens
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
	class="edit-link-dialog absolute z-40 mt-1 bg-white p-4 shadow-xl overflow-visible max-h-90"
	style="position-anchor: --{path.join('-')}; position-area: block-end span-all; justify-self: anchor-center;"
	onclick={handle_backdrop_click}
>
	<div class="flex flex-col gap-3">
		<h2 class="text-lg font-semibold text-gray-900">Edit Link</h2>
		<div class="flex flex-col gap-2">
			<label for="edit-link-href" class="text-sm text-gray-600">URL</label>
			<input
				id="edit-link-href"
				bind:this={href_input_ref}
				type="url"
				bind:value={href_input_value}
				placeholder="https://example.com"
				class="w-72 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
				onkeydown={handle_keydown}
			/>
		</div>
		<label class="flex items-center gap-2 cursor-pointer">
			<input
				type="checkbox"
				bind:checked={open_in_new_tab}
				class="w-4 h-4 cursor-pointer"
			/>
			<span class="text-sm text-gray-600">Open in new tab</span>
		</label>
		<div class="flex justify-end gap-2">
			<button
				type="button"
				class="cursor-pointer px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
				onclick={close}
			>
				Cancel
			</button>
			<button
				type="button"
				class="cursor-pointer bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
				onclick={save}
			>
				Save
			</button>
		</div>
	</div>
</dialog>

<style>
	.edit-link-dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
</style>