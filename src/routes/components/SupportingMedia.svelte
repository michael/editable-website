<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import SizableViewbox from './SizableViewbox.svelte';

	const prose = getContext('prose');
	let { path } = $props();

	// The Prose or ProseGridItem node's layout determines alignment
	let is_centered = $derived(prose.is_centered);
</script>

<Node {path}>
	<SizableViewbox {path} class={is_centered ? 'mx-auto' : ''} style="border-radius: var(--image-border-radius)">
		<MediaProperty class="supporting-media" path={[...path, 'media']} />
	</SizableViewbox>
</Node>
