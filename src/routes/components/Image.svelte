<script>
	import { getContext } from 'svelte';
	const svedit = getContext('svedit');

	let { path } = $props();
	let node = $derived(svedit.session.get(path));

	// Apply scale to image
	let image_style = $derived(`
		object-position: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
		transform: scale(${node.scale});
		transform-origin: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
		object-fit: ${node.object_fit};
	`);
</script>

{#if node.src}
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

	/* Placeholder styling */
	img.placeholder {
		opacity: 0.7;
		border: 2px dashed var(--stroke-color);
		border-radius: var(--s-2);
		padding: var(--s-4);
		background: var(--canvas-fill-color);
	}
</style>
