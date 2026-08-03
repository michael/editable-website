<script lang="ts">
	import { get_svedit_context } from '../svedit_context.js';
	import type { Nodes } from '#lib/document_schema.js';
	import { setContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import type { DocumentPath, NodeArrayAttachmentContext } from 'svedit';
	import { TW_PAGE_PADDING_X, TW_LIMITER } from '../tailwind_theme.js';

	const svedit = get_svedit_context();
	let {
		path,
		mark: section = null
	}: { path: DocumentPath; mark?: NodeArrayAttachmentContext | null } = $props();
	let node: Nodes['prose'] = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 'narrow-left');
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);

	setContext('prose', {
		get is_centered() {
			return layout === 'narrow-centered-text' || layout === 'wide-centered-text';
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
		class="flex flex-col gap-5 sm:gap-7 {heading_spacing}"
		path={[...path, 'body']}
	/>
{/snippet}

{#snippet narrow_left()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} max-w-4xl">
				{@render body()}
			</div>
		</div>
	</div>
{/snippet}

{#snippet narrow_center()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} mx-auto max-w-4xl">
				{@render body()}
			</div>
		</div>
	</div>
{/snippet}

{#snippet narrow_right()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} ml-auto max-w-4xl">
				{@render body()}
			</div>
		</div>
	</div>
{/snippet}

{#snippet narrow_centered_text()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} mx-auto max-w-4xl text-center text-balance">
				{@render body()}
			</div>
		</div>
	</div>
{/snippet}

{#snippet wide_left()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class={TW_PAGE_PADDING_X}>
				{@render body()}
			</div>
		</div>
	</div>
{/snippet}

{#snippet wide_centered_text()}
	<div class={TW_LIMITER}>
		<div
			class={[
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="{TW_PAGE_PADDING_X} text-center text-balance">
				{@render body()}
			</div>
		</div>
	</div>
{/snippet}

<Node class="ew-prose layout-{layout} bg-(--background) text-(--foreground)" {path}>
	{@const layouts = {
		'narrow-left': narrow_left,
		'narrow-center': narrow_center,
		'narrow-right': narrow_right,
		'narrow-centered-text': narrow_centered_text,
		'wide-left': wide_left,
		'wide-centered-text': wide_centered_text
	}}
	{@render layouts[layout]()}
</Node>
