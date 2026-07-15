<script>
	import { getContext, setContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));

	let prose_grid_path = $derived(path.slice(0, -2));
	let prose_grid_node = $derived(svedit.session.get(prose_grid_path));
	let layout = $derived(prose_grid_node.layout || 'plain');

	setContext('prose', {
		get is_centered() {
			return layout === 'cards';
		}
	});

	const heading_spacing = `
		[&>div:has(h1)~div>h1]:pt-8
		[&>div:has(h2)~div>h2]:pt-6
		[&>div:has(h3)~div>h3]:pt-6
		[&>span:has(.ew-eyebrow)~div>span.ew-eyebrow]:pt-6
	`;
</script>

{#snippet body()}
	<NodeArrayProperty
		class="flex flex-col gap-5 [--row:0] sm:gap-7 {heading_spacing}"
		path={[...path, 'body']}
	/>
{/snippet}

{#snippet plain()}
	<div class="py-10 sm:py-14 md:py-16 lg:py-28">
		<div class="max-w-4xl">
			{@render body()}
		</div>
	</div>
{/snippet}

{#snippet card()}
	<div
		class="h-full border border-(--border) bg-(--muted) px-8 py-10"
		style:border-radius="var(--image-border-radius)"
	>
		<div class="text-center text-balance">
			{@render body()}
		</div>
	</div>
{/snippet}

<Node class="ew-prose-grid-item bg-(--background) text-(--foreground)" {path}>
	{#if layout === 'cards'}
		{@render card()}
	{:else}
		{@render plain()}
	{/if}
</Node>
