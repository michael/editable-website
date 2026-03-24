<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
</script>

<Node {path}>
	<div class="{TW_LIMITER}">
		<div class="figure {TW_PAGE_PADDING_X} py-16">
			<div class="overflow-hidden" style:border-radius="var(--image-border-radius)">
				<MediaProperty path={[...path, 'media']} sizing="fit" fallback_aspect_ratio="16 / 9" />
			</div>
		</div>
	</div>
</Node>