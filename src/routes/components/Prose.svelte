<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_PAGE_PADDING_X, TW_BLOCK_PADDING_Y, TW_MOBILE_LEFT_INSET, TW_LIMITER } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
	let colorset_class = $derived(node.colorset ? `ew-colorset-${node.colorset}` : '');

	const heading_spacing = `
		[&>div:has(h1)~div>h1]:pt-8
		[&>div:has(h2)~div>h2]:pt-6
		[&>div:has(h3)~div>h3]:pt-6
		[&>span:has(.ew-eyebrow)~div>span.ew-eyebrow]:pt-6
	`;
</script>

{#snippet content()}
	<NodeArrayProperty class="space-y-5 md:space-y-8 {heading_spacing}" path={[...path, 'content']} />
{/snippet}

<!-- Layout 1: Left-aligned -->
{#snippet layout_1()}
	<div class="{TW_LIMITER}">
		<div class="{TW_BLOCK_PADDING_Y}">
			<div class="{TW_PAGE_PADDING_X} max-w-4xl">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Layout 2: Centered -->
{#snippet layout_2()}
	<div class="{TW_LIMITER}">
		<div class="{TW_BLOCK_PADDING_Y}">
			<div class="{TW_PAGE_PADDING_X} mx-auto max-w-4xl text-center">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Layout 3: Right-aligned -->
{#snippet layout_3()}
	<div class="{TW_LIMITER}">
		<div class="grid grid-cols-3 {TW_BLOCK_PADDING_Y}">
			<!-- IMPORTANT: Keep in sync with TW_PAGE_PADDING_X -->
			<div class="max-sm:pl-5 max-md:pl-7 pr-5 sm:pr-7 md:pr-10 lg:pr-14 col-span-3 md:col-span-2 md:col-start-2">
				<div class="{TW_MOBILE_LEFT_INSET} max-w-4xl">
					{@render content()}
				</div>
			</div>
		</div>
	</div>
{/snippet}

<Node class="ew-prose lg:text-lg layout-{layout} bg-(--background) text-(--foreground) {colorset_class}" {path}>
	{@const layouts = [layout_1, layout_2, layout_3]}
	{@render layouts[layout - 1]()}
</Node>
