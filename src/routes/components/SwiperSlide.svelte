<script>
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	let { path } = $props();
</script>

<Node class="swiper-slide" {path}>
	<div class="w-full h-full">
		<MediaProperty path={[...path, 'media']} sizing="fill" />
	</div>
</Node>
