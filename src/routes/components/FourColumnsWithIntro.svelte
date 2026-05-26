<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import SlideHeader from './SlideHeader.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let has_intro = $derived(node.intro?.length > 0);
</script>

<Node class="ew-four-columns-with-intro flex h-screen flex-col overflow-hidden bg-(--background) text-(--foreground)" {path}>
	<SlideHeader />
	<div class="min-h-0 flex-1 overflow-hidden">
		<div class="{TW_LIMITER} flex h-full flex-col py-6 sm:py-8 md:py-10 lg:py-12">
			{#if has_intro || svedit.editable}
				<div class="{TW_PAGE_PADDING_X} pb-5 md:pb-7">
					<NodeArrayProperty
						class="ew-four-columns-intro flex max-w-4xl flex-col gap-5 md:gap-8 lg:text-lg{!has_intro ? ' empty' : ''}"
						path={[...path, 'intro']}
					/>
				</div>
			{/if}

			<div class="{TW_PAGE_PADDING_X} min-h-0 flex-1">
				<NodeArrayProperty
					class="[--row:1] grid h-full grid-cols-1 gap-5 sm:grid-cols-2 md:gap-7 lg:grid-cols-4 lg:gap-8"
					path={[...path, 'columns']}
				/>
			</div>
		</div>
	</div>
</Node>

<style>
	:global(.ew-four-columns-intro.empty) {
		position: relative;
	}

	:global(.ew-four-columns-intro.empty .empty-node-placeholder) {
		position: absolute;
	}
</style>
