<script module>
	export const LAYOUT_COUNT = 1;
</script>

<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty, AnnotatedTextProperty } from 'svedit';
	import { TW_PAGE_PADDING_X, TW_LIMITER } from '../tailwind_theme.js';
	import { reveal } from '../reveal.js';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let has_buttons = $derived(node.buttons?.length > 0);
	let layout = $derived(node.layout || 1);
	let colorset_class = $derived(node.colorset ? `ew-colorset-${node.colorset}` : '');
</script>

{#snippet layout_1()}
	<div class="{TW_LIMITER}">
		<div class="{TW_PAGE_PADDING_X} py-10 sm:py-14 md:py-16 lg:py-28 mx-auto max-w-7xl flex flex-col" use:reveal>
			<div class="w-full text-center">
				<AnnotatedTextProperty
					tag="h1"
					class="ew-h1 leading-tight font-serif text-5xl md:text-6xl lg:text-7xl text-balance text-(--foreground)"
					path={[...path, 'title']}
					placeholder="Your bold statement goes here"
				/>
				<AnnotatedTextProperty
					tag="p"
					class="mt-6 md:mt-8 text-lg md:text-xl text-balance"
					path={[...path, 'description']}
					placeholder="A supporting sentence that adds context and draws visitors in. Keep it clear, concise, and compelling."
				/>
				<NodeArrayProperty
					class="[--row:1] hero-buttons flex flex-wrap items-center justify-center gap-4{has_buttons ? ' mt-10' : ' empty'}"
					path={[...path, 'buttons']}
				/>
			</div>
			<div
				style:border-radius="var(--image-border-radius)"
				class="mt-10 md:mt-14 lg:mt-16 w-full aspect-video overflow-hidden"
			>
				<MediaProperty path={[...path, 'media']} />
			</div>
			<div class="flex-1 min-h-0"></div>
		</div>
	</div>
{/snippet}

<Node class="ew-media-hero lg:text-lg bg-(--background) text-(--foreground) {colorset_class}" {path}>
	{@const layouts = [layout_1]}
	{@render layouts[layout - 1]()}
</Node>

<style>
	/* When buttons are empty, keep the placeholder visible without affecting layout. */
	:global(.hero-buttons.empty) {
		position: relative;
	}

	:global(.hero-buttons.empty .empty-node-placeholder) {
		position: absolute;
		top: 1rem;
		right: auto;
		bottom: auto;
		left: 0;
		width: 24px;
	}

	:global(.hero-buttons.empty.justify-center .empty-node-placeholder) {
		left: calc(50% - 12px);
	}

	:global(.ew-media-hero h1) {
		--highlight-thickness: 6px;
	}
</style>
