<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { TW_PAGE_PADDING_X, TW_LIMITER } from '../tailwind_theme.js';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path, annotation: section = null } = $props();
	let node = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, 'media']));
	let media_aspect_ratio = $derived(
		media_node.width && media_node.height ? `${media_node.width} / ${media_node.height}` : undefined
	);
	let feature_layout = $derived(node.layout === 2 ? 2 : 1);
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
</script>

<!-- Primitives -->
{#snippet image(placeholder_aspect_ratio = '3 / 4', border_radius = false)}
	<div class="flex h-full w-full items-center">
		<div
			class="w-full overflow-hidden"
			style:border-radius={border_radius ? 'var(--image-border-radius)' : undefined}
			style:aspect-ratio={media_aspect_ratio ?? placeholder_aspect_ratio}
		>
			<MediaProperty path={[...path, 'media']} />
		</div>
	</div>
{/snippet}

{#snippet body()}
	<NodeArrayProperty
		class="ew-feature-body flex flex-col gap-5 sm:gap-7"
		path={[...path, 'body']}
	/>
{/snippet}

{#snippet layout_1()}
	<div class={TW_LIMITER}>
		<div
			class={[
				`grid grid-cols-1 md:grid-cols-2 ${TW_PAGE_PADDING_X} gap-5 sm:gap-7`,
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="flex flex-col justify-center pb-0" use:reveal>
				<div class="max-w-2xl">{@render body()}</div>
			</div>
			<div use:reveal={{ delay: 200 }}>
				{@render image('3 / 4', true)}
			</div>
		</div>
	</div>
{/snippet}

{#snippet layout_2()}
	<div class={TW_LIMITER}>
		<div
			class={[
				`grid grid-cols-1 md:grid-cols-2 ${TW_PAGE_PADDING_X} gap-5 sm:gap-7`,
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div class="max-md:order-2" use:reveal={{ delay: 200 }}>
				{@render image('3 / 4', true)}
			</div>
			<div class="flex flex-col justify-center pb-0 max-md:order-1" use:reveal>
				<div class="max-w-2xl">{@render body()}</div>
			</div>
		</div>
	</div>
{/snippet}

<Node class="ew-feature bg-(--background) text-(--foreground)" {path}>
	{@const layouts = [layout_1, layout_2]}
	{@render layouts[feature_layout - 1]()}
</Node>
