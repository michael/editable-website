<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path, annotation: section = null } = $props();
	let node = $derived(svedit.session.get(path));
	let accordion_layout = $derived(node.layout || 1);
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
</script>

{#snippet layout_1()}
	<Node class="ew-accordion" {path}>
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

{#snippet layout_2()}
	<Node class="ew-accordion" {path}>
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

{#snippet layout_3()}
	<Node class="ew-accordion" {path}>
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

{#snippet layout_4()}
	<Node class="ew-accordion" {path}>
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

{#snippet layout_5()}
	<Node class="ew-accordion" {path}>
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

{#if accordion_layout === 2}
	{@render layout_2()}
{:else if accordion_layout === 3}
	{@render layout_3()}
{:else if accordion_layout === 4}
	{@render layout_4()}
{:else if accordion_layout === 5}
	{@render layout_5()}
{:else}
	{@render layout_1()}
{/if}
