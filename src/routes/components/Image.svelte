<script>
	import { getContext } from 'svelte';
	import { ASSET_BASE, VARIANT_WIDTHS } from '$lib/config.js';
	const svedit = getContext('svedit');

	/** @type {{ path: any[] }} */
	let { path } = $props();
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

	// Use mime_type with fallback to file extension for legacy data
	let is_svg = $derived(
		node.mime_type ? node.mime_type === 'image/svg+xml' : node.src?.endsWith('.svg')
	);
	let is_gif = $derived(
		node.mime_type ? node.mime_type === 'image/gif' : node.src?.endsWith('.gif')
	);


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

	let is_scale_down = $derived(node.object_fit === 'scale-down');

	// For scale-down: cap the img element to its DPR-corrected natural size
	// and position it within the parent using the focal point.
	// SVGs don't need DPR correction since they scale cleanly.
	let dpr = $derived(typeof window !== 'undefined' ? window.devicePixelRatio : 2);

	let css_natural_width = $derived(
		is_scale_down && node.width && !is_svg
			? Math.round(node.width / dpr)
			: undefined
	);

	let css_natural_height = $derived(
		is_scale_down && node.height && !is_svg
			? Math.round(node.height / dpr)
			: undefined
	);

	// Apply scale to image
	let image_style = $derived.by(() => {
		if (is_scale_down) {
			// Position the img absolutely within the overflow-hidden parent.
			// left/top set by focal point %, translate pulls it back so the
			// focal point itself lands at that position — same trick as
			// background-position semantics.
			let parts = [
				`position: absolute`,
				`left: ${node.focal_point_x * 100}%`,
				`top: ${node.focal_point_y * 100}%`,
				`translate: ${-node.focal_point_x * 100}% ${-node.focal_point_y * 100}%`,
				`transform: scale(${node.scale})`,
				`transform-origin: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%`,
				`object-fit: contain`
			];

			if (css_natural_width !== undefined) {
				parts.push(`max-width: ${css_natural_width}px`);
			}
			if (css_natural_height !== undefined) {
				parts.push(`max-height: ${css_natural_height}px`);
			}

			return parts.join('; ') + ';';
		}

		return [
			`object-position: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%`,
			`transform: scale(${node.scale})`,
			`transform-origin: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%`,
			`object-fit: ${node.object_fit}`
		].join('; ') + ';';
	});
</script>

{#if display_src}
	<img
		contenteditable="false"
		src={display_src}
		srcset={srcset || undefined}
		sizes={srcset ? '50vw' : undefined}
		alt={node.alt}
		width={node.width}
		height={node.height}
		class:scale-down-mode={is_scale_down}
		style={image_style}
	/>
{/if}

<style>
	img {
		width: 100%;
		height: 100%;
		transform-origin: center center;
	}

	img.scale-down-mode {
		width: auto;
		height: auto;
	}
</style>