<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty, AnnotatedTextProperty } from 'svedit';
	import { TW_PAGE_PADDING_X, TW_MOBILE_LEFT_INSET, TW_LIMITER } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let has_buttons = $derived(node.buttons?.length > 0);
	let layout = $derived(node.layout || 1);
</script>

{#snippet layout_1()}
	<div class="{TW_LIMITER}">
		<div class="border-(--foreground-subtle) xl:border-r xl:border-l py-20 md:py-28 lg:py-36">
			<div class="{TW_PAGE_PADDING_X} mx-auto max-w-5xl text-center">
				<AnnotatedTextProperty
					tag="h1"
					class="font-light text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-balance text-(--accent)"
					path={[...path, 'title']}
					placeholder="Your bold statement goes here"
				/>
				<AnnotatedTextProperty
					tag="p"
					class="mt-6 text-lg md:text-xl lg:text-2xl text-balance font-light"
					path={[...path, 'description']}
					placeholder="A supporting sentence that adds context and draws visitors in. Keep it clear, concise, and compelling."
				/>
				<NodeArrayProperty
					class="hero-buttons [--layout-orientation:horizontal] flex flex-wrap items-center justify-center gap-4 mt-10{!has_buttons ? ' empty' : ''}"
					path={[...path, 'buttons']}
				/>
			</div>
		</div>
	</div>
{/snippet}

{#snippet layout_2()}
	<div class="{TW_LIMITER}">
		<div class="border-(--foreground-subtle) xl:border-r xl:border-l py-20 md:py-28 lg:py-36">
			<div class="{TW_PAGE_PADDING_X} max-w-4xl">
				<AnnotatedTextProperty
					tag="h1"
					class="font-light text-3xl md:text-4xl lg:text-5xl text-balance text-(--accent)"
					path={[...path, 'title']}
					placeholder="Your bold statement goes here"
				/>
				<AnnotatedTextProperty
					tag="p"
					class="mt-6 text-lg md:text-xl lg:text-2xl text-balance font-light"
					path={[...path, 'description']}
					placeholder="A supporting sentence that adds context and draws visitors in. Keep it clear, concise, and compelling."
				/>
				<NodeArrayProperty
					class="hero-buttons [--layout-orientation:horizontal] flex flex-wrap items-center gap-4 mt-10{!has_buttons ? ' empty' : ''}"
					path={[...path, 'buttons']}
				/>
			</div>
		</div>
	</div>
{/snippet}

{#snippet layout_3()}
	<div class="{TW_LIMITER}">
		<div class="border-(--foreground-subtle) xl:border-r xl:border-l py-20 md:py-28 lg:py-36">
			<div class="{TW_PAGE_PADDING_X} mx-auto max-w-4xl text-center">
				<AnnotatedTextProperty
					tag="h1"
					class="font-light text-3xl md:text-4xl lg:text-5xl text-balance text-(--accent)"
					path={[...path, 'title']}
					placeholder="Your bold statement goes here"
				/>
				<AnnotatedTextProperty
					tag="p"
					class="mt-6 text-lg md:text-xl lg:text-2xl text-balance font-light"
					path={[...path, 'description']}
					placeholder="A supporting sentence that adds context and draws visitors in. Keep it clear, concise, and compelling."
				/>
				<NodeArrayProperty
					class="hero-buttons [--layout-orientation:horizontal] flex flex-wrap items-center justify-center gap-4 mt-10{!has_buttons ? ' empty' : ''}"
					path={[...path, 'buttons']}
				/>
			</div>
		</div>
	</div>
{/snippet}

{#snippet layout_4()}
	<div class="{TW_LIMITER}">
		<div class="border-(--foreground-subtle) xl:border-r xl:border-l grid grid-cols-3 py-20 md:py-28 lg:py-36">
			<!-- IMPORTANT: Keep in sync with TW_PAGE_PADDING_X -->
			<div class="max-sm:pl-5 max-md:pl-7 pr-5 sm:pr-7 md:pr-10 lg:pr-14 col-span-3 md:col-span-2 md:col-start-2">
				<div class="{TW_MOBILE_LEFT_INSET}">
					<AnnotatedTextProperty
						tag="h1"
						class="font-light text-3xl md:text-4xl lg:text-5xl text-balance text-(--accent)"
						path={[...path, 'title']}
						placeholder="Your bold statement goes here"
					/>
					<AnnotatedTextProperty
						tag="p"
						class="mt-6 text-lg md:text-xl lg:text-2xl text-balance font-light"
						path={[...path, 'description']}
						placeholder="A supporting sentence that adds context and draws visitors in. Keep it clear, concise, and compelling."
					/>
					<NodeArrayProperty
						class="hero-buttons [--layout-orientation:horizontal] flex flex-wrap items-center gap-4 mt-10{!has_buttons ? ' empty' : ''}"
						path={[...path, 'buttons']}
					/>
				</div>
			</div>
		</div>
	</div>
{/snippet}

<Node class="ew-hero border-b border-(--foreground-subtle)" {path}>
	{@const layouts = [layout_1, layout_2, layout_3, layout_4]}
	{@render layouts[layout - 1]()}
</Node>

<style>
	/* When buttons array is empty, prevent the empty node placeholder from taking up vertical space */
	:global(.hero-buttons.empty .node.empty-node-array) {
		position: absolute !important;
	}
</style>
