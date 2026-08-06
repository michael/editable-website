<script lang="ts">
	import type { Nodes } from '#app/editable_schema.js';
	import { get_svedit_context } from '#app/svedit_context.js';
	import { Node, NodeArrayProperty } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { TW_PAGE_PADDING_X, TW_LIMITER } from '#app/tailwind_theme.js';
	import { reveal } from '#app/reveal.js';

	const svedit = get_svedit_context();
	let { path, mark: section = null } = $props();
	let node: Nodes['feature'] = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, 'media']));
	let render_as_link = $derived(!svedit.editable && node.href);
	let media_aspect_ratio = $derived(
		media_node.width && media_node.height ? `${media_node.width} / ${media_node.height}` : undefined
	);
	let feature_layout = $derived(node.layout === 'image-left' ? 'image-left' : 'image-right');
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
</script>

<!-- Primitives -->
{#snippet image(placeholder_aspect_ratio = '3 / 4', border_radius = false)}
	<div class="flex h-full w-full items-center">
		<svelte:element
			this={render_as_link ? 'a' : 'div'}
			href={render_as_link ? node.href : undefined}
			target={render_as_link ? node.target : undefined}
			class="block w-full overflow-hidden outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
			style:border-radius={border_radius ? 'var(--image-border-radius)' : undefined}
			style:aspect-ratio={media_aspect_ratio ?? placeholder_aspect_ratio}
		>
			<MediaProperty path={[...path, 'media']} />
		</svelte:element>
	</div>
{/snippet}

{#snippet body()}
	<NodeArrayProperty
		class="ew-feature-body flex flex-col gap-5 sm:gap-7"
		path={[...path, 'body']}
	/>
{/snippet}

{#snippet image_right()}
	<div class={TW_LIMITER}>
		<div
			class={[
				`grid grid-cols-1 md:grid-cols-2 ${TW_PAGE_PADDING_X} gap-x-10 gap-y-5 sm:gap-y-7 lg:gap-x-14`,
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

{#snippet image_left()}
	<div class={TW_LIMITER}>
		<div
			class={[
				`grid grid-cols-1 md:grid-cols-2 ${TW_PAGE_PADDING_X} gap-x-10 gap-y-5 sm:gap-y-7 lg:gap-x-14`,
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
	{#if feature_layout === 'image-left'}
		{@render image_left()}
	{:else}
		{@render image_right()}
	{/if}
</Node>
