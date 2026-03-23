<script>
	import { getContext } from 'svelte';
	import { CustomProperty } from 'svedit';
	import Media from './Media.svelte';

	const svedit = getContext('svedit');

	/**
	 * @type {{
	 *   path: any[],
	 *   aspect_ratio?: string | number,
	 *   mask?: boolean,
	 *   class?: string
	 * }}
	 */
	let { path, aspect_ratio, mask = false, class: css_class } = $props();
	let node = $derived(svedit.session.get(path));

	// Derive aspect ratio from node dimensions if not explicitly provided
	let resolved_aspect_ratio = $derived(
		aspect_ratio ?? (node.width && node.height ? `${node.width} / ${node.height}` : undefined)
	);

	let is_selected = $derived(is_property_selected());

	function is_property_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const this_path = path.join('.');
		return path_of_selection === this_path;
	}
</script>

<CustomProperty class={css_class} path={path}>
	<div
		contenteditable="false"
		style:aspect-ratio={resolved_aspect_ratio}
		class="overflow-hidden h-full"
		class:ew-bg-checkerboard={is_selected || !node.src}
	>
		<Media {path} {mask} />
	</div>
</CustomProperty>