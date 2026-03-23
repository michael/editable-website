<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let item_index = $derived(typeof path[path.length - 1] === 'number' ? path[path.length - 1] : 0);
</script>

<Node class="gallery-item" {path}>
  <div use:reveal={{ delay: item_index * 150 }}>
	<div class="overflow-hidden" style:border-radius="var(--image-border-radius)">
		<MediaProperty class="image-property" inner_class="image-wrapper" path={[...path, 'media']} aspect_ratio="container" />
	</div>
  </div>
</Node>