<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = getContext('svedit');
	let { path, mark: section = null } = $props();
	let node = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, 'media']));
	let figure_layout = $derived(node.layout || 1);
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
	let media_aspect_ratio = $derived(
		media_node?.width && media_node?.height ? `${media_node.width} / ${media_node.height}` : '2/1'
	);
</script>

{#snippet media_frame(border_radius = true)}
	<div
		class="overflow-hidden"
		style:border-radius={border_radius ? 'var(--image-border-radius)' : undefined}
		style:aspect-ratio={media_aspect_ratio}
	>
		<MediaProperty path={[...path, 'media']} />
	</div>
{/snippet}

{#snippet layout_1()}
	<div class={TW_LIMITER}>
		<div
			class={[
				`figure ${TW_PAGE_PADDING_X}`,
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			{@render media_frame()}
		</div>
	</div>
{/snippet}

{#snippet layout_2()}
	<div class={TW_LIMITER}>
		<div
			class={[
				'figure',
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} max-w-4xl">
				{@render media_frame()}
			</div>
		</div>
	</div>
{/snippet}

{#snippet layout_3()}
	<div class={TW_LIMITER}>
		<div
			class={[
				'figure',
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} mx-auto max-w-4xl">
				{@render media_frame()}
			</div>
		</div>
	</div>
{/snippet}

{#snippet layout_4()}
	<div class={TW_LIMITER}>
		<div
			class={[
				'figure',
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} ml-auto max-w-4xl">
				{@render media_frame()}
			</div>
		</div>
	</div>
{/snippet}

{#snippet layout_5()}
	<div class={TW_LIMITER}>
		<div class="figure {TW_PAGE_PADDING_X} py-0">
			{@render media_frame()}
		</div>
	</div>
{/snippet}

{#snippet layout_6()}
	<div class="w-full">
		<div class="figure">
			{@render media_frame(false)}
		</div>
	</div>
{/snippet}

<Node {path}>
	{@const layouts = [layout_1, layout_2, layout_3, layout_4, layout_5, layout_6]}
	{@render layouts[figure_layout - 1]()}
</Node>
