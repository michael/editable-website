<script>
	import { getContext } from 'svelte';
	import { CustomProperty } from 'svedit';
	import Media from './Media.svelte';

	const svedit = getContext('svedit');

	/**
	 * @type {{
	 *   path: any[],
	 *   aspect_ratio?: 'intrinsic' | 'container',
	 *   fallback_aspect_ratio?: string | number,
	 *   mask?: boolean,
	 *   class?: string,
	 *   inner_class?: string
	 * }}
	 */
	let {
		path,
		aspect_ratio = 'container',
		fallback_aspect_ratio = '16 / 9',
		mask = false,
		class: css_class,
		inner_class
	} = $props();
	let node = $derived(svedit.session.get(path));

	// 'intrinsic': use image's natural dimensions, fall back to fallback_aspect_ratio when empty.
	// 'container': no inline aspect-ratio, parent controls the size.
	let resolved_aspect_ratio = $derived(
		aspect_ratio === 'intrinsic'
			? (node.width && node.height ? `${node.width} / ${node.height}` : fallback_aspect_ratio)
			: undefined
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
		class="overflow-hidden h-full {inner_class || ''}"
		class:ew-bg-checkerboard={is_selected || !node.src}
	>
		<Media {path} {mask} />
	</div>
</CustomProperty>