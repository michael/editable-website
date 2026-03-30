<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { ASSET_BASE } from '$lib/config.js';
	import { reveal } from '../reveal.js';

	let { path } = $props();

	const svedit = getContext('svedit');
	let item_index = $derived(
		typeof path[path.length - 1] === 'number' ? path[path.length - 1] : 0
	);
	let media_node = $derived(svedit.session.get([...path, 'media']));

	// Resolve the full-size image URL for Fancybox
	let is_blob = $derived(media_node?.src?.startsWith('blob:'));
	let display_src = $derived(
		is_blob ? media_node.src : media_node?.src ? `${ASSET_BASE}/${media_node.src}` : ''
	);
</script>

<Node class="gallery-item" {path}>
	<div
		class="image-wrapper overflow-hidden"
		class:cursor-pointer={!svedit.editable && display_src}
		style:border-radius="var(--image-border-radius)"
		use:reveal={{ delay: item_index * 150 }}
		data-fancybox={!svedit.editable ? 'gallery' : undefined}
		data-src={!svedit.editable ? display_src : undefined}
	>
		<MediaProperty class="image-property" path={[...path, 'media']} sizing="fill" />
	</div>
</Node>
