<script>
	import { getContext } from 'svelte';
	import { ASSET_BASE, VARIANT_WIDTHS } from '$lib/config.js';
	const svedit = getContext('svedit');

	/** @type {{ path: any[], mask?: boolean }} */
	let { path, mask = false } = $props();
	let node = $derived(svedit.session.get(path));

	// Determine if src is a blob URL (unsaved), a saved asset id, or empty
	let is_blob = $derived(node.src?.startsWith('blob:'));
	let is_saved = $derived(node.src && !is_blob);

	// Resolve the display URL
	let display_src = $derived(
		is_blob ? node.src :
		is_saved ? `${ASSET_BASE}/${node.src}` :
		''
	);

	let is_svg = $derived(node.src?.endsWith('.svg'));
	let is_gif = $derived(node.src?.endsWith('.gif'));
	let use_mask = $derived(mask && is_svg && display_src);

	// Build srcset for saved raster images (not SVGs, not GIFs, not blobs)
	let srcset = $derived(build_srcset());

	function build_srcset() {
		if (!is_saved || is_svg || is_gif) return '';

		const ext_index = node.src.lastIndexOf('.');
		if (ext_index === -1) return '';

		const asset_stem = node.src.slice(0, ext_index);
		const applicable = VARIANT_WIDTHS.filter((w) => w < node.width);

		if (applicable.length === 0) return '';

		const variant_entries = applicable.map(
			(w) => `${ASSET_BASE}/${asset_stem}/w${w}.webp ${w}w`
		);
		// The original is the largest entry
		variant_entries.push(`${ASSET_BASE}/${node.src} ${node.width}w`);

		return variant_entries.join(', ');
	}

	// Apply scale to image
	let image_style = $derived(`
		object-position: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
		transform: scale(${node.scale});
		transform-origin: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
		object-fit: ${node.object_fit};
	`);

	// Mask style for SVGs that need to inherit color
	let mask_style = $derived(`
		mask-image: url('${display_src}');
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
		-webkit-mask-image: url('${display_src}');
		-webkit-mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		-webkit-mask-position: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
		transform: scale(${node.scale});
		transform-origin: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
	`);
</script>

{#if use_mask}
	<div
		contenteditable="false"
		class="mask-image"
		style={mask_style}
		role="img"
		aria-label={node.alt}
	></div>
{:else if display_src}
	<img
		contenteditable="false"
		src={display_src}
		srcset={srcset || undefined}
		sizes={srcset ? '50vw' : undefined}
		alt={node.alt}
		width={node.width}
		height={node.height}
		style={image_style}
	/>
{/if}

<style>
	img {
		width: 100%;
		height: 100%;
		transform-origin: center center;
	}

	/* Mask mode for SVGs - uses currentColor via background */
	.mask-image {
		width: 100%;
		height: 100%;
		background-color: var(--foreground);
	}
</style>