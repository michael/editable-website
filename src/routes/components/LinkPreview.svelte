<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	let { node, path } = $props();

	function handle_edit() {
		const edit_link_command = svedit.session.commands?.edit_link;
		if (edit_link_command) {
			edit_link_command.execute();
		}
	}
</script>

<div
	class="link-preview absolute z-30 mt-1 pointer-events-auto"
	style="position-anchor: --{path.join('-')}; position-area: block-end span-all; justify-self: anchor-center;"
>
	{#if node.href}
		<div class="flex items-center gap-3 bg-white border border-editing px-3 py-2">
			<a
				href={node.href}
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm text-gray-700 max-w-70 truncate hover:underline"
			>
				{node.href}
			</a>
			<button
				type="button"
				class="text-sm text-editing cursor-pointer shrink-0 hover:opacity-80"
				onclick={handle_edit}
			>
				EDIT
			</button>
		</div>
	{:else}
		<button
			type="button"
			class="bg-white border border-editing text-editing text-sm px-12 py-2 cursor-pointer hover:bg-gray-50"
			onclick={handle_edit}
		>
			CREATE LINK
		</button>
	{/if}
</div>
