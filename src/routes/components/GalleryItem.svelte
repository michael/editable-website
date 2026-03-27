<script>
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { reveal } from '../reveal.js';
	let { path } = $props();
	let item_index = $derived(typeof path[path.length - 1] === 'number' ? path[path.length - 1] : 0);
</script>

<Node class="gallery-item" {path}>
	<div
		class="image-wrapper overflow-hidden"
		style:border-radius="var(--image-border-radius)"
		use:reveal={{ delay: item_index * 150 }}
	>
		<MediaProperty class="image-property" path={[...path, 'media']} />
	</div>
</Node>
