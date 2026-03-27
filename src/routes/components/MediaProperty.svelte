<script>
	import { getContext } from 'svelte';
	import { CustomProperty } from 'svedit';
	import Media from './Media.svelte';

	const svedit = getContext('svedit');

	/**
	 * @type {{
	 *   path: any[],
	 *   sizing?: 'fill' | 'fit' | 'native',
	 *   placeholder_aspect_ratio?: string | number,
	 *   placeholder_width?: number,
	 *   class?: string
	 * }}
	 */
	let {
		path,
		sizing = 'fill',
		placeholder_aspect_ratio = '16 / 9',
		placeholder_width = 200,
		class: css_class = ''
	} = $props();
	let node = $derived(svedit.session.get(path));

	// Compute aspect ratio for fit/native modes
	let resolved_aspect_ratio = $derived(
		sizing === 'fill'
			? undefined
			: (node.width && node.height ? `${node.width} / ${node.height}` : placeholder_aspect_ratio)
	);

	// Compute CSS-pixel width for native mode.
	// SVGs use their viewBox dimensions directly (no retina scaling).
	// Raster images divide by devicePixelRatio for correct retina display.
	let css_pixel_width = $derived(compute_css_pixel_width());

	function compute_css_pixel_width() {
		if (!node.src || !node.width) return placeholder_width;
		if (node.mime_type === 'image/svg+xml') return node.width;
		const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 2;
		return Math.round(node.width / dpr);
	}

	// In native mode: use max-width when image is set, width when empty
	// (flex contexts need an explicit width for aspect-ratio to work)
	let native_style = $derived(
		sizing === 'native'
			? (node.src ? `max-width: ${css_pixel_width}px` : `width: ${css_pixel_width}px`)
			: undefined
	);

	let is_selected = $derived(is_property_selected());

	function is_property_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const this_path = path.join('.');
		return path_of_selection === this_path;
	}
</script>

<CustomProperty class="{sizing === 'fill' ? 'h-full ' : ''}{css_class}" style={native_style} path={path}>
	<div
		contenteditable="false"
		style:aspect-ratio={resolved_aspect_ratio}
		class="overflow-hidden h-full"
		class:ew-bg-checkerboard={is_selected || !node.src}
	>
		<Media {path} />
	</div>
</CustomProperty>