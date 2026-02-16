<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');

	/** @type {{ path: any[], mask?: boolean }} */
	let { path, mask = false } = $props();
	let node = $derived(svedit.session.get(path));
	let is_svg = $derived(node.src?.endsWith('.svg'));
	let use_mask = $derived(mask && is_svg && node.src);

	// Apply scale to image
	let image_style = $derived(`
		object-position: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
		transform: scale(${node.scale});
		transform-origin: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
		object-fit: ${node.object_fit};
	`);

	// Mask style for SVGs that need to inherit color
	let mask_style = $derived(`
		mask-image: url('${node.src}');
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
		-webkit-mask-image: url('${node.src}');
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
{:else if node.src}
	<img
		contenteditable="false"
		src={node.src || '/image-placeholder.webp'}
		alt={node.alt}
		width={node.width}
		height={node.height}
		class:placeholder={!node.src}
		style={image_style}
	/>
{/if}

<style>
	img {
		width: 100%;
		height: 100%;
		user-select: none;
		pointer-events: none;
		transform-origin: center center;
		/*transition: transform 0.05s linear;*/
	}

	/* Mask mode for SVGs - uses currentColor via background */
	.mask-image {
		width: 100%;
		height: 100%;
		user-select: none;
		pointer-events: none;
		background-color: var(--foreground);
	}

	/* Placeholder styling */
	img.placeholder {
		opacity: 0.7;
		border: 2px dashed var(--stroke-color);
		border-radius: var(--s-2);
		padding: var(--s-4);
		background: var(--canvas-fill-color);
	}
</style>
