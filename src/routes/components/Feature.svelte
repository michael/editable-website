<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { TW_PAGE_PADDING, TW_MOBILE_LEFT_INSET, TW_LIMITER } from '../tailwind_theme.js';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, 'media']));
	let media_aspect_ratio = $derived(
		media_node.width && media_node.height ? `${media_node.width} / ${media_node.height}` : '3 / 4'
	);
	let colorset_class = $derived(node.colorset ? `ew-colorset-${node.colorset}` : '');
</script>

<!-- Primitives -->
{#snippet image(fallback_ratio = '3 / 4', border_radius = false)}
	<div class="flex items-center h-full w-full">
		<div
			class="overflow-hidden w-full"
			style:border-radius={border_radius ? 'var(--image-border-radius)' : undefined}
			style:aspect-ratio={media_node.width && media_node.height ? media_aspect_ratio : fallback_ratio}
		>
			<MediaProperty path={[...path, 'media']} />
		</div>
	</div>
{/snippet}

{#snippet body()}
	<NodeArrayProperty
		class="ew-feature-body flex flex-col gap-8"
		path={[...path, 'body']}
	/>
{/snippet}

<!-- Default layout for Feature -->
{#snippet layout_1()}
	<div class="{TW_LIMITER}">
		<div class="grid grid-cols-1 md:grid-cols-2 pt-5 sm:pt-7 md:pt-0">
			<div class="flex flex-col justify-center {TW_PAGE_PADDING} pb-0" use:reveal>
				<div class="max-w-2xl">{@render body()}</div>
			</div>
			<div class="{TW_PAGE_PADDING}" use:reveal={{ delay: 200 }}>
				{@render image('3 / 4', true)}
			</div>
		</div>
	</div>
{/snippet}

<!-- Like layout 1 but flipped horizontally -->
{#snippet layout_2()}
	<div class="{TW_LIMITER}">
		<div class="grid grid-cols-1 md:grid-cols-2 pt-5 sm:pt-7 md:pt-0">
			<div class="{TW_PAGE_PADDING} max-md:order-2" use:reveal={{ delay: 200 }}>
				{@render image('3 / 4', true)}
			</div>
			<div class="flex flex-col justify-center {TW_PAGE_PADDING} pb-0 max-md:order-1" use:reveal>
				<div class="max-w-2xl">{@render body()}</div>
			</div>
		</div>
	</div>
{/snippet}

<!-- Like layout 1 but image stretches to edges (full bleed) -->
{#snippet layout_3()}
	<div class="{TW_LIMITER}">
		<div class="grid grid-cols-1 md:grid-cols-2 pt-5 sm:pt-7 md:pt-0">
			<div class="flex flex-col justify-center {TW_PAGE_PADDING}" use:reveal>
				<div class="max-w-2xl">{@render body()}</div>
			</div>
			<div use:reveal={{ delay: 200 }}>
				{@render image()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Like layout 3 but flipped (image left, text right, full bleed) -->
{#snippet layout_4()}
	<div class="{TW_LIMITER}">
		<div class="grid grid-cols-1 md:grid-cols-2 pt-5 sm:pt-7 md:pt-0">
			<div class="max-md:order-2" use:reveal={{ delay: 200 }}>
				{@render image()}
			</div>
			<div class="flex flex-col justify-center {TW_PAGE_PADDING} max-md:order-1" use:reveal>
				<div class="max-w-2xl">{@render body()}</div>
			</div>
		</div>
	</div>
{/snippet}

<Node class="ew-feature lg:text-lg bg-(--background) text-(--foreground) {colorset_class}" {path}>
	{@const layouts = [layout_1, layout_2, layout_3, layout_4]}
	{@render layouts[node.layout - 1]()}
</Node>