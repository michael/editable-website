<script>
	import { getContext } from 'svelte';
	import { Node, CustomProperty } from 'svedit';
	import Image from './Image.svelte';
	import Video from './Video.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let image_node = $derived(svedit.session.get([...path, 'image']));

	// Read the parent Prose node's layout to determine alignment
	// path is like ['body', index, 'content', index] — the Prose node is at path[0..2]
	let prose_path = $derived(path.slice(0, -2));
	let prose_node = $derived(svedit.session.get(prose_path));
	let is_centered = $derived(prose_node?.type === 'prose' && prose_node?.layout === 2);

	// Intrinsic CSS-pixel width: divide the raw pixel width by 2 for retina.
	// Default to 200px when no image is set yet, to hint that this is for small decorative elements.
	const DEFAULT_WIDTH = 200;
	let css_width = $derived(
		image_node.width ? Math.round(image_node.width / 2) : DEFAULT_WIDTH
	);

	let aspect_ratio = $derived(
		image_node.width && image_node.height
			? `${image_node.width} / ${image_node.height}`
			: '16 / 9'
	);

	let custom_property_style = $derived(build_style());

	function build_style() {
		let parts = [];
		parts.push(`max-width: ${css_width}px`);
		if (is_centered) parts.push('margin: 0 auto');
		return parts.length > 0 ? parts.join('; ') : undefined;
	}

	let is_selected = $derived(is_image_selected());

	function is_image_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const _image_path = [...path, 'image'].join('.');
		return path_of_selection == _image_path;
	}
</script>

<Node {path}>
	<CustomProperty path={[...path, 'image']} style={custom_property_style}>
		<div
			contenteditable="false"
			style:border-radius="var(--image-border-radius)"
			style:aspect-ratio={aspect_ratio}
			class="overflow-hidden"
			class:ew-bg-checkerboard={is_selected || !image_node.src}
		>
			{#if image_node.type === 'video'}
				<Video path={[...path, 'image']} />
			{:else}
				<Image path={[...path, 'image']} />
			{/if}
		</div>
	</CustomProperty>
</Node>