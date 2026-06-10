<script>
	import { getContext, setContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_PAGE_PADDING_X, TW_MOBILE_LEFT_INSET, TW_LIMITER } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
	let colorset_class = $derived(node.colorset ? `ew-colorset-${node.colorset}` : '');

	setContext('prose', {
		get is_centered() {
			return layout === 4;
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
	<NodeArrayProperty class="flex flex-col gap-5 md:gap-8 {heading_spacing}" path={[...path, 'content']} />
{/snippet}

<!-- Layout 1: Left-oriented -->
{#snippet layout_1()}
	<div class="{TW_LIMITER}">
		<div class="py-10 sm:py-14 md:py-16 lg:py-28">
			<div class="{TW_PAGE_PADDING_X} max-w-4xl">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Layout 2: Center-oriented -->
{#snippet layout_2()}
	<div class="{TW_LIMITER}">
		<div class="py-10 sm:py-14 md:py-16 lg:py-28">
			<div class="{TW_PAGE_PADDING_X} mx-auto max-w-4xl">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Layout 3: Right-oriented -->
{#snippet layout_3()}
	<div class="{TW_LIMITER}">
		<div class="grid grid-cols-3 py-10 sm:py-14 md:py-16 lg:py-28">
			<!-- IMPORTANT: Keep in sync with TW_PAGE_PADDING_X -->
			<div class="max-sm:pl-5 max-md:pl-7 pr-5 sm:pr-7 md:pr-10 lg:pr-14 col-span-3 md:col-span-2 md:col-start-2">
				<div class="{TW_MOBILE_LEFT_INSET} max-w-4xl">
					{@render content()}
				</div>
			</div>
		</div>
	</div>
{/snippet}

<!-- Layout 4: Centered -->
{#snippet layout_4()}
	<div class="{TW_LIMITER}">
		<div class="py-10 sm:py-14 md:py-16 lg:py-28">
			<div class="{TW_PAGE_PADDING_X} mx-auto max-w-4xl text-center text-balance">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<Node class="ew-prose layout-{layout} bg-(--background) text-(--foreground) {colorset_class}" {path}>
	{@const layouts = [layout_1, layout_2, layout_3, layout_4]}
	{@render layouts[layout - 1]()}
</Node>
