<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
	let has_intro = $derived(node.intro && node.intro.length > 0);
	let has_outro = $derived(node.outro && node.outro.length > 0);

	const heading_spacing = `
		[&>div:has(h1)~div>h1]:pt-8
		[&>div:has(h2)~div>h2]:pt-6
		[&>div:has(h3)~div>h3]:pt-4
	`;
</script>

{#snippet intro()}
	{@const intro_padding = has_intro ? 'py-5 sm:py-7 md:py-10 lg:py-14' : 'py-2.5 sm:py-3.5 md:py-5 lg:py-7'}
	<div class="{TW_PAGE_PADDING_X} max-w-4xl lg:text-lg {intro_padding}">
		<NodeArrayProperty class="ew-intro space-y-5 md:space-y-8 {heading_spacing}" path={[...path, 'intro']} />
	</div>
{/snippet}

{#snippet outro()}
	{@const outro_padding = has_outro ? 'pt-5 sm:pt-7 pb-10 sm:pb-12 md:py-10 lg:py-14' : 'pt-2.5 sm:pt-3.5 pb-10 sm:pb-12 md:py-10 lg:py-14'}
	<div class="{TW_PAGE_PADDING_X} max-w-4xl lg:text-lg {outro_padding}">
		<NodeArrayProperty class="ew-intro space-y-5 md:space-y-8 {heading_spacing}" path={[...path, 'outro']} />
	</div>
{/snippet}

<Node {path}>
	<div class="border-b border-(--foreground-subtle)">
		<div class="{TW_LIMITER} w-full">
			<div class="border-l border-r border-(--foreground-subtle)">
				{@render intro()}
				<div class="{TW_PAGE_PADDING_X}">
					<NodeArrayProperty
						class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-7 md:gap-10 lg:gap-14 [--layout-orientation:horizontal]"
						path={[...path, 'link_collection_items']}
					/>
				</div>
				{@render outro()}
			</div>
		</div>
	</div>
</Node>


<style>
	/* HACK: When intro or outro is empty, prevent the empty node placeholder from taking up vertical space */
	:global(.ew-intro .node.empty-node-array, .ew-outro .node.empty-node-array) {
		min-height: 0 !important;
	}
</style>
