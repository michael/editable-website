<script>
	import { getContext, setContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));

	let prose_grid_path = $derived(path.slice(0, -2));
	let prose_grid_node = $derived(svedit.session.get(prose_grid_path));
	let layout = $derived(prose_grid_node.layout || 1);
	let colorset_class = $derived(node.colorset ? `ew-colorset-${node.colorset}` : '');

	setContext('prose', {
		get is_centered() {
			return layout === 2;
		},
	});

	const heading_spacing = `
		[&>div:has(h1)~div>h1]:pt-8
		[&>div:has(h2)~div>h2]:pt-6
		[&>div:has(h3)~div>h3]:pt-6
		[&>span:has(.ew-eyebrow)~div>span.ew-eyebrow]:pt-6
	`;
</script>

{#snippet content()}
	<NodeArrayProperty class="[--row:0] flex flex-col gap-5 md:gap-8 {heading_spacing}" path={[...path, 'content']} />
{/snippet}

<!-- Layout 1: Left-aligned -->
{#snippet layout_1()}
	<div class="{TW_LIMITER}">
		<div class="py-10 sm:py-14 md:py-16 lg:py-28">
			<div class="max-w-4xl">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Layout 2: Centered -->
{#snippet layout_2()}
	<div class="{TW_LIMITER}">
		<div class="py-10 sm:py-14 md:py-16 lg:py-28">
			<div class="mx-auto max-w-4xl text-center text-balance">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<Node class="ew-prose-grid-item bg-(--background) text-(--foreground) {colorset_class}" {path}>
	{@const layouts = [layout_1, layout_2]}
	{@render layouts[layout - 1]()}
</Node>
