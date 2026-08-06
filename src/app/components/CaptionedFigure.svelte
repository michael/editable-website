<script lang="ts">
	import type { Nodes } from '#app/editable_schema.js';
	import { get_svedit_context } from '#app/svedit_context.js';
	import { Node, TextProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '#app/tailwind_theme.js';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = get_svedit_context();
	let { path, mark: section = null } = $props();
	let node: Nodes['captioned_figure'] = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, 'media']));
	let render_as_link = $derived(!svedit.editable && node.href);
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
</script>

<Node {path}>
	<div class={TW_LIMITER}>
		<div
			class={[
				`captioned-figure ${TW_PAGE_PADDING_X}`,
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<svelte:element
				this={render_as_link ? 'a' : 'div'}
				href={render_as_link ? node.href : undefined}
				target={render_as_link ? node.target : undefined}
				class="block overflow-hidden outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
				style:border-radius="var(--image-border-radius)"
				style:aspect-ratio={media_node.width && media_node.height
					? `${media_node.width} / ${media_node.height}`
					: '2 / 1'}
			>
				<MediaProperty path={[...path, 'media']} />
			</svelte:element>
			<TextProperty
				tag="figcaption"
				class="mt-4 text-sm leading-6 sm:text-base"
				path={[...path, 'caption']}
				placeholder="Caption"
			/>
		</div>
	</div>
</Node>
