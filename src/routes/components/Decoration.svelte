<script>
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import SizableViewbox from './SizableViewbox.svelte';

	let { path } = $props();
</script>

<Node {path}>
	<SizableViewbox {path}>
		<MediaProperty class="decoration-media" path={[...path, 'media']} />
	</SizableViewbox>
</Node>
