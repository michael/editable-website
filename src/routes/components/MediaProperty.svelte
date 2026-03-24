<script>
	import { getContext } from 'svelte';
	import { CustomProperty } from 'svedit';
	import Media from './Media.svelte';

	const svedit = getContext('svedit');

	/**
	 * @type {{
	 *   path: any[],
	 *   sizing?: 'fill' | 'fit' | 'native',
	 *   fallback_aspect_ratio?: string | number,
	 *   fallback_width?: number,
	 *   mask?: boolean,
	 *   class?: string
	 * }}
	 */
	let {
		path,
		sizing = 'fill',
		fallback_aspect_ratio = '16 / 9',
		fallback_width = 200,
		mask = false,
		class: css_class
	} = $props();
	let node = $derived(svedit.session.get(path));

	// Compute aspect ratio for fit/native modes
	let resolved_aspect_ratio = $derived(
		sizing === 'fill'
			? undefined
			: (node.width && node.height ? `${node.width} / ${node.height}` : fallback_aspect_ratio)
	);

	// Compute CSS-pixel width for native mode.
	// SVGs use their viewBox dimensions directly (no retina scaling).
	// Raster images divide by devicePixelRatio for correct retina display.
	let css_pixel_width = $derived(compute_css_pixel_width());

	function compute_css_pixel_width() {
		if (!node.width) return fallback_width;
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
</script>

<CustomProperty class={css_class} style={native_style} path={path}>
	<div
		contenteditable="false"
		style:aspect-ratio={resolved_aspect_ratio}
		class="overflow-hidden h-full"
		class:ew-bg-checkerboard={!node.src}
	>
		<Media {path} {mask} />
	</div>
</CustomProperty>