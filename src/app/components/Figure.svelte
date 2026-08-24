<script lang="ts">
	import type { Nodes } from '#app/document_schema.js';
	import { get_svedit_context } from '#app/svedit_context.js';
	import { Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '#app/tailwind_theme.js';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = get_svedit_context();
	let { path, mark: section = null } = $props();
	let node: Nodes['figure'] = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, 'media']));
	let render_as_link = $derived(!svedit.editable && node.href);
	let figure_layout = $derived(node.layout || 'wide');
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
	let media_aspect_ratio = $derived(
		media_node?.width && media_node?.height ? `${media_node.width} / ${media_node.height}` : '2/1'
	);
</script>

{#snippet media_frame(border_radius = true)}
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block overflow-hidden outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--editing)"
		style:border-radius={border_radius ? 'var(--image-border-radius)' : undefined}
		style:aspect-ratio={media_aspect_ratio}
	>
		<MediaProperty path={[...path, 'media']} />
	</svelte:element>
{/snippet}

{#snippet wide()}
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

{#snippet narrow_left()}
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

{#snippet narrow_center()}
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

{#snippet narrow_right()}
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

{#snippet flush()}
	<div class={TW_LIMITER}>
		<div class="figure {TW_PAGE_PADDING_X} py-0">
			{@render media_frame()}
		</div>
	</div>
{/snippet}

{#snippet full_bleed()}
	<div class="w-full">
		<div class="figure">
			{@render media_frame(false)}
		</div>
	</div>
{/snippet}

<Node {path}>
	{@const layouts = {
		wide,
		'narrow-left': narrow_left,
		'narrow-center': narrow_center,
		'narrow-right': narrow_right,
		flush,
		'full-bleed': full_bleed
	}}
	{@render layouts[figure_layout]()}
</Node>
