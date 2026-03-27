<script module>
	export const LAYOUT_COUNT = 1;
</script>

<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import SizableViewbox from './SizableViewbox.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();

	// Read the parent Prose node's layout to determine alignment
	// path is like ['body', index, 'content', index] — the Prose node is at path[0..2]
	let prose_path = $derived(path.slice(0, -2));
	let prose_node = $derived(svedit.session.get(prose_path));
	let is_centered = $derived(prose_node?.type === 'prose' && prose_node?.layout === 2);
</script>

<Node {path}>
	<SizableViewbox {path} class={is_centered ? 'mx-auto' : ''}>
		<MediaProperty
			class="decoration-media"
			path={[...path, 'media']}
			sizing="fill"
			fallback_aspect_ratio="16 / 9"
		/>
	</SizableViewbox>
</Node>
