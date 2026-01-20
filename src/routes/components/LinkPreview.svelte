<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	let { node, path } = $props();

	function handle_edit() {
		// TODO: Trigger EditLink modal via EditLinkCommand
		console.log('Edit link:', node.href);
	}
</script>

<div
	class="link-preview flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-md"
	style="position-anchor: --{path.join('-')};"
>
	{#if node.href}
		<a
			href={node.href}
			target="_blank"
			rel="noopener noreferrer"
			class="block max-w-56 truncate text-gray-700 underline"
		>
			{node.href}
		</a>
	{:else}
		<span class="text-gray-400 italic">No link set</span>
	{/if}
	<button
		aria-label="Edit Link"
		type="button"
		class="shrink-0 cursor-pointer rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
		onclick={handle_edit}
	>
		<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
			<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
		</svg>
	</button>
</div>

<style>
	.link-preview {
		position: absolute;
		position-area: block-end span-all;
		justify-self: anchor-center;
		margin-top: 4px;
		pointer-events: auto;
		z-index: 30;
	}
</style>