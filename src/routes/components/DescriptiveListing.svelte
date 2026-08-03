<script lang="ts">
	import type { Nodes } from '#lib/document_schema.js';
	import { get_svedit_context } from '../svedit_context.js';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	const svedit = get_svedit_context();
	let { path, mark: section = null } = $props();
	let node: Nodes['descriptive_listing'] = $derived(svedit.session.get(path));
	let listing_layout = $derived(node.layout || 'narrow-left');
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
</script>

{#snippet narrow_left()}
	<Node class="ew-descriptive-listing" {path}>
		<div class="{TW_LIMITER} w-full">
			<div
				class={[
					padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
					padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
				]}
			>
				<div class="max-w-4xl {TW_PAGE_PADDING_X} bg-(--background) text-(--foreground)">
					<NodeArrayProperty class="flex flex-col" path={[...path, 'items']} />
				</div>
			</div>
		</div>
	</Node>
{/snippet}

{#snippet narrow_center()}
	<Node class="ew-descriptive-listing" {path}>
		<div class="{TW_LIMITER} w-full">
			<div
				class={[
					padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
					padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
				]}
			>
				<div class="mx-auto max-w-4xl {TW_PAGE_PADDING_X} bg-(--background) text-(--foreground)">
					<NodeArrayProperty class="flex flex-col" path={[...path, 'items']} />
				</div>
			</div>
		</div>
	</Node>
{/snippet}

{#snippet narrow_right()}
	<Node class="ew-descriptive-listing" {path}>
		<div class="{TW_LIMITER} w-full">
			<div
				class={[
					padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
					padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
				]}
			>
				<div class="ml-auto max-w-4xl {TW_PAGE_PADDING_X} bg-(--background) text-(--foreground)">
					<NodeArrayProperty class="flex flex-col" path={[...path, 'items']} />
				</div>
			</div>
		</div>
	</Node>
{/snippet}

{#snippet full_width()}
	<Node class="ew-descriptive-listing" {path}>
		<div class="{TW_LIMITER} w-full">
			<div
				class={[
					TW_PAGE_PADDING_X,
					padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
					padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
				]}
			>
				<div class="bg-(--background) text-(--foreground)">
					<NodeArrayProperty class="flex flex-col" path={[...path, 'items']} />
				</div>
			</div>
		</div>
	</Node>
{/snippet}

{#snippet two_columns()}
	<Node class="ew-descriptive-listing" {path}>
		<div class="{TW_LIMITER} w-full">
			<div
				class={[
					TW_PAGE_PADDING_X,
					padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
					padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
				]}
			>
				<div class="bg-(--background) text-(--foreground)">
					<NodeArrayProperty
						class="grid grid-cols-1 gap-x-10 gap-y-0 lg:grid-cols-2 lg:gap-x-14 lg:[--row:1]"
						path={[...path, 'items']}
					/>
				</div>
			</div>
		</div>
	</Node>
{/snippet}

{#if listing_layout === 'narrow-center'}
	{@render narrow_center()}
{:else if listing_layout === 'narrow-right'}
	{@render narrow_right()}
{:else if listing_layout === 'full-width'}
	{@render full_width()}
{:else if listing_layout === 'two-columns'}
	{@render two_columns()}
{:else}
	{@render narrow_left()}
{/if}
