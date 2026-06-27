<script>
	import { getContext, setContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_PAGE_PADDING_X, TW_LIMITER } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path, node_array_annotation: section = null } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
	let colorset_class = $derived(node.colorset ? `ew-colorset-${node.colorset}` : '');
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);

	setContext('prose', {
		get is_centered() {
			return layout === 4 || layout === 6;
		}
	});

	const heading_spacing = `
		[&>div:has(h1)~div>h1]:pt-8
		[&>div:has(h2)~div>h2]:pt-6
		[&>div:has(h3)~div>h3]:pt-6
		[&>span:has(.ew-eyebrow)~div>span.ew-eyebrow]:pt-6
	`;
</script>

{#snippet content()}
	<NodeArrayProperty
		class="flex flex-col gap-5 sm:gap-7 {heading_spacing}"
		path={[...path, 'content']}
	/>
{/snippet}

<!-- Layout 1: Left-aligned -->
{#snippet layout_1()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} max-w-4xl">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Layout 2: Center-oriented -->
{#snippet layout_2()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} mx-auto max-w-4xl">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Layout 3: Right-oriented -->
{#snippet layout_3()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} ml-auto max-w-4xl">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Layout 4: Centered -->
{#snippet layout_4()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} mx-auto max-w-4xl text-center text-balance">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Layout 5: Full width, left-oriented -->
{#snippet layout_5()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class={TW_PAGE_PADDING_X}>
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Layout 6: Full width, centered -->
{#snippet layout_6()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} text-center text-balance">
				{@render content()}
			</div>
		</div>
	</div>
{/snippet}

<Node
	class="ew-prose layout-{layout} bg-(--background) text-(--foreground) {colorset_class}"
	{path}
>
	{@const layouts = [layout_1, layout_2, layout_3, layout_4, layout_5, layout_6]}
	{@render layouts[layout - 1]()}
</Node>
