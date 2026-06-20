<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let listing_layout = $derived(node.layout || 1);
</script>

{#snippet layout_1()}
	<Node class="ew-descriptive-listing" {path}>
		<div class="mx-auto max-w-4xl bg-(--background) text-(--foreground)">
			<div class="px-5 sm:px-7 md:px-10 lg:px-14 py-10 sm:py-14 md:py-20 lg:py-28">
				<NodeArrayProperty class="flex flex-col" path={[...path, 'items']} />
			</div>
		</div>
	</Node>
{/snippet}

{#snippet layout_2()}
	<Node class="ew-descriptive-listing" {path}>
		<div class="{TW_LIMITER} w-full">
			<div class="{TW_PAGE_PADDING_X} py-10 sm:py-14 md:py-20 lg:py-28">
				<NodeArrayProperty class="grid grid-cols-1 gap-x-10 gap-y-0 lg:grid-cols-2 lg:gap-x-14 lg:[--row:1]" path={[...path, 'items']} />
			</div>
		</div>
	</Node>
{/snippet}

{#if listing_layout === 2}
	{@render layout_2()}
{:else}
	{@render layout_1()}
{/if}
