<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	let toggle_link_command = $derived(svedit.session.commands?.toggle_link);
	let link_input_value = $state('https://');
	let link_input_ref;

	function create_link() {
		if (link_input_value) {
			svedit.session.apply(svedit.session.tr.annotate_text('link', { href: link_input_value }));
		}
		close();
	}

	function cancel() {
		close();
	}

	function close() {
		if (toggle_link_command) {
			toggle_link_command.show_prompt = false;
		}
		svedit.focus_canvas();
		link_input_value = 'https://';
	}

	function handle_keydown(event) {
		event.stopPropagation();

		if (event.key === 'Enter') {
			event.preventDefault();
			create_link();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			cancel();
		}
	}

	$effect(() => {
		if (toggle_link_command?.show_prompt && link_input_ref) {
			link_input_ref.focus();
			link_input_ref.select();
		}
	});
</script>

<div
	class="create-link-popover flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-md"
>
	<input
		bind:this={link_input_ref}
		type="url"
		bind:value={link_input_value}
		placeholder="https://example.com"
		class="w-48 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
		onkeydown={handle_keydown}
	/>
	<button
		type="button"
		class="cursor-pointer rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
		onclick={create_link}
	>
		Create
	</button>
	<button
		aria-label="Cancel"
		type="button"
		class="shrink-0 cursor-pointer rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
		onclick={cancel}
	>
		<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<line x1="18" y1="6" x2="6" y2="18"></line>
			<line x1="6" y1="6" x2="18" y2="18"></line>
		</svg>
	</button>
</div>

<style>
	.create-link-popover {
	  position-anchor: --selection-highlight;
		position: absolute;
		position-area: block-end span-all;
		justify-self: anchor-center;
		margin-top: 4px;
		pointer-events: auto;
		z-index: 30;
		position-try-fallbacks: flip-block;
	}
</style>
