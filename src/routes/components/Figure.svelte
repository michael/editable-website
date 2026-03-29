<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
	let media_node = $derived(svedit.session.get([...path, 'media']));
</script>

<Node {path}>
	<div class="{TW_LIMITER}">
		<div class="figure {TW_PAGE_PADDING_X} py-16">
			<div
				class="overflow-hidden"
				style:border-radius="var(--image-border-radius)"
				style:aspect-ratio={media_node.width && media_node.height ? `${media_node.width} / ${media_node.height}` : '16 / 9'}
			>
				<MediaProperty path={[...path, 'media']} />
			</div>
		</div>
	</div>
</Node>