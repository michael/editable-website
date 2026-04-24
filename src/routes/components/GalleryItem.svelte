<script>
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { reveal } from '../reveal.js';
	let { path } = $props();
</script>

<Node class="gallery-item" {path}>
	<div
		class="image-wrapper overflow-hidden"
		style:border-radius="var(--image-border-radius)"
		use:reveal
	>
		<MediaProperty class="image-property" path={[...path, 'media']} />
	</div>
</Node>
