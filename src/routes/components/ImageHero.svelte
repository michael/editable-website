<script>
	import { getContext } from 'svelte';
	import { Node, CustomProperty, NodeArrayProperty, AnnotatedTextProperty } from 'svedit';
	import Image from './Image.svelte';

	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let bg_node = $derived(svedit.session.get([...path, 'background']));
	let has_buttons = $derived(node.buttons?.length > 0);
	let layout = $derived(node.layout || 1);
	let colorset_class = $derived(node.colorset ? `ew-colorset-${node.colorset}` : '');

	// Determine if the background image CustomProperty is selected
	// This drives the checkerboard pattern when no image is loaded
	let is_bg_selected = $derived(is_background_selected());

	function is_background_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const bg_path = [...path, 'background'].join('.');
		return path_of_selection === bg_path;
	}
</script>

{#snippet background_image()}
	<!-- CustomProperty wrapping the image makes paste go through handle_media_paste's
             "property" branch, so pasting an image updates only the background src —
             it does not replace the whole hero block. -->
	<CustomProperty path={[...path, 'background']} class="image-hero-bg-property">
		<div
			contenteditable="false"
			class="absolute inset-0 overflow-hidden select-none"
			class:ew-bg-checkerboard={is_bg_selected || !bg_node.src}
		>
			<Image path={[...path, 'background']} />
		</div>
	</CustomProperty>
{/snippet}

{#snippet overlay()}
	<!-- Semi-transparent gradient overlay for text legibility -->
	<div class="image-hero-gradient pointer-events-none absolute inset-0" aria-hidden="true"></div>
{/snippet}

{#snippet scroll_down()}
	<div class="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
		<svg
			class="size-8 text-white drop-shadow-md"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7-7-7"
			></path>
		</svg>
	</div>
{/snippet}

<!-- Layout 1: centered text -->
{#snippet layout_1()}
	<div class="relative flex min-h-[90vh] items-center justify-center">
		{@render background_image()}
		{@render overlay()}
		<div
			class="relative z-10 mx-auto w-full max-w-4xl px-5 py-24 text-center sm:px-7 md:px-10 lg:px-14"
		>
			<AnnotatedTextProperty
				tag="h1"
				class="ew-h1 font-sans text-4xl text-balance text-white drop-shadow-lg md:text-5xl lg:text-6xl"
				path={[...path, 'title']}
				placeholder={svedit.editable ? 'Your hero headline goes here' : undefined}
			/>
			<AnnotatedTextProperty
				tag="p"
				class="mt-6 text-lg text-balance text-white/90 drop-shadow md:text-xl"
				path={[...path, 'description']}
				placeholder={svedit.editable ? 'A compelling subtitle that draws visitors in.' : undefined}
			/>
			<NodeArrayProperty
				class="hero-buttons flex flex-wrap items-center justify-center gap-4 [--row:1] mt-10{!has_buttons
					? ' empty'
					: ''}"
				path={[...path, 'buttons']}
			/>
		</div>
	</div>
{/snippet}

<!-- Layout 2: left-aligned text -->
{#snippet layout_2()}
	<div class="relative flex min-h-[90vh] items-center">
		{@render background_image()}
		{@render overlay()}
		<div class="relative z-10 w-full max-w-3xl px-5 py-24 sm:px-7 md:px-10 lg:px-14">
			<AnnotatedTextProperty
				tag="h1"
				class="ew-h1 font-sans text-4xl text-balance text-white drop-shadow-lg md:text-5xl lg:text-6xl"
				path={[...path, 'title']}
				placeholder={svedit.editable ? 'Your hero headline goes here' : undefined}
			/>
			<AnnotatedTextProperty
				tag="p"
				class="mt-6 text-lg text-balance text-white/90 drop-shadow md:text-xl"
				path={[...path, 'description']}
				placeholder={svedit.editable ? 'A compelling subtitle that draws visitors in.' : undefined}
			/>
			<NodeArrayProperty
				class="hero-buttons flex flex-wrap items-center gap-4 [--row:1] mt-10{!has_buttons
					? ' empty'
					: ''}"
				path={[...path, 'buttons']}
			/>
		</div>
	</div>
{/snippet}

<!-- Layout 3: centered text, no overlay -->
{#snippet layout_3()}
	<div class="relative flex min-h-[90vh] items-center justify-center">
		{@render background_image()}
		<div
			class="relative z-10 mx-auto w-full max-w-4xl px-5 py-24 text-center sm:px-7 md:px-10 lg:px-14"
		>
			<AnnotatedTextProperty
				tag="h1"
				class="ew-h1 font-sans text-4xl text-balance text-white drop-shadow-lg md:text-5xl lg:text-6xl"
				path={[...path, 'title']}
				placeholder={svedit.editable ? 'Your hero headline goes here' : undefined}
			/>
			<AnnotatedTextProperty
				tag="p"
				class="mt-6 text-lg text-balance text-white/90 drop-shadow md:text-xl"
				path={[...path, 'description']}
				placeholder={svedit.editable ? 'A compelling subtitle that draws visitors in.' : undefined}
			/>
			<NodeArrayProperty
				class="hero-buttons flex flex-wrap items-center justify-center gap-4 [--row:1] mt-10{!has_buttons
					? ' empty'
					: ''}"
				path={[...path, 'buttons']}
			/>
		</div>
		{@render scroll_down()}
	</div>
{/snippet}

<Node class="ew-image-hero {colorset_class}" {path}>
	{@const layouts = [layout_1, layout_2, layout_3]}
	{@render layouts[layout - 1]()}
</Node>

<style>
	:global(.ew-image-hero) {
		position: relative;
		overflow: hidden;
	}

	:global(.ew-image-hero .image-hero-bg-property) {
		position: absolute !important;
		inset: 0;
		z-index: 0;
	}

	.image-hero-gradient {
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.15) 0%,
			rgba(0, 0, 0, 0.45) 60%,
			rgba(0, 0, 0, 0.65) 100%
		);
		z-index: 1;
	}

	/* When buttons array is empty, prevent the empty node placeholder from taking up vertical space */
	:global(.ew-image-hero .hero-buttons.empty .node.empty-node-array) {
		position: absolute !important;
	}

	:global(.ew-image-hero h1) {
		--highlight-thickness: 6px;
	}
</style>
