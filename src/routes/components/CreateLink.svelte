<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

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
	class="create-link-dialog absolute z-40 mt-1 m-0 bg-white p-0 shadow-xl overflow-visible max-h-90 border border-(--editing-stroke-color)"
	style="position-anchor: --selection-highlight; position-area: block-end span-all; justify-self: anchor-center;"
	onclick={handle_backdrop_click}
>
	<div class="flex flex-col">
		<input
			bind:this={href_input_ref}
			type="url"
			bind:value={href_input_value}
			placeholder="https://example.com"
			class="w-72 px-3 py-2 text-sm text-gray-700 border-b border-gray-200 focus:border-(--editing-stroke-color) focus:ring-(--editing-stroke-color)"
			onkeydown={handle_keydown}
		/>
		<div class="flex items-center justify-between px-3 py-2">
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={open_in_new_tab}
					class="w-4 h-4 cursor-pointer text-(--editing-stroke-color) focus:ring-(--editing-stroke-color)"
				/>
				<span class="text-sm text-gray-600">Open in new tab</span>
			</label>
			<button
				type="button"
				class="text-sm text-(--editing-stroke-color) cursor-pointer shrink-0 hover:opacity-80"
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