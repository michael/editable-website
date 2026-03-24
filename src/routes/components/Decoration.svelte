<script module>
	export const LAYOUT_COUNT = 1;
</script>

<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
	let media_node = $derived(svedit.session.get([...path, 'media']));

	// Read the parent Prose node's layout to determine alignment
	// path is like ['body', index, 'content', index] — the Prose node is at path[0..2]
	let prose_path = $derived(path.slice(0, -2));
	let prose_node = $derived(svedit.session.get(prose_path));
	let is_centered = $derived(prose_node?.type === 'prose' && prose_node?.layout === 2);

	// Intrinsic CSS-pixel width: divide the raw pixel width by 2 for retina.
	// SVGs use their viewBox dimensions directly (no retina scaling).
	// Default to 200px when no image is set yet, to hint that this is for small decorative elements.
	const DEFAULT_WIDTH = 200;
	let is_svg = $derived(media_node.mime_type === 'image/svg+xml');
	let css_width = $derived(
		media_node.width
			? (is_svg ? media_node.width : Math.round(media_node.width / 2))
			: DEFAULT_WIDTH
	);

	let wrapper_style = $derived(build_wrapper_style());

	function build_wrapper_style() {
		let parts = [`max-width: ${css_width}px`];
		if (is_centered) parts.push('margin: 0 auto');
		return parts.join('; ');
	}
</script>

<Node {path}>
	<div class="overflow-hidden" style="{wrapper_style}; border-radius: var(--image-border-radius)">
		<MediaProperty path={[...path, 'media']} aspect_ratio="intrinsic" fallback_aspect_ratio="16 / 9" />
	</div>
</Node>