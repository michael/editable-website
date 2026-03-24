<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

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
	class="edit-link-dialog absolute z-40 m-0 mt-1 max-h-90 overflow-visible border-1 border-(--svedit-editing-stroke) bg-white p-0 shadow-xl"
	style="position-anchor: --{path.join(
		'-'
	)}; position-area: block-end span-all; justify-self: anchor-center;"
	onclick={handle_backdrop_click}
>
	<div class="flex flex-col">
		<input
			bind:this={href_input_ref}
			type="url"
			bind:value={href_input_value}
			placeholder="https://example.com"
			class="w-72 border-0 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-1 focus:ring-(--svedit-editing-stroke)"
			onkeydown={handle_keydown}
		/>
		<div class="flex items-center justify-between px-3 py-2">
			<label class="flex cursor-pointer items-center gap-2">
				<input
					type="checkbox"
					bind:checked={open_in_new_tab}
					class="h-4 w-4 cursor-pointer text-(--svedit-editing-stroke) focus:ring-(--svedit-editing-stroke)"
				/>
				<span class="text-sm text-gray-600">Open in new tab</span>
			</label>
			<button
				type="button"
				class="shrink-0 cursor-pointer text-sm text-(--svedit-editing-stroke) hover:opacity-80"
				onclick={save}
			>
				UPDATE
			</button>
		</div>
	</div>
</dialog>

<style>
	.edit-link-dialog::backdrop {
		background: rgba(0, 0, 0, 0.15);
	}
</style>
