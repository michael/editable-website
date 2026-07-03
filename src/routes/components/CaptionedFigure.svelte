<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = getContext('svedit');
	let { path, annotation: section = null } = $props();
	let media_node = $derived(svedit.session.get([...path, 'media']));
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
			<div
				class="overflow-hidden"
				style:border-radius="var(--image-border-radius)"
				style:aspect-ratio={media_node.width && media_node.height
					? `${media_node.width} / ${media_node.height}`
					: '2 / 1'}
			>
				<MediaProperty path={[...path, 'media']} />
			</div>
			<TextProperty
				tag="figcaption"
				class="mt-4 text-sm leading-6 sm:text-base"
				path={[...path, 'caption']}
				placeholder="Caption"
			/>
		</div>
	</div>
</Node>
