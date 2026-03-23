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
	 *   class?: string
	 * }}
	 */
	let {
		path,
		aspect_ratio = 'container',
		fallback_aspect_ratio = '16 / 9',
		mask = false,
		class: css_class
	} = $props();
	let node = $derived(svedit.session.get(path));

	// 'intrinsic': use image's natural dimensions, fall back to fallback_aspect_ratio when empty.
	// 'container': no inline aspect-ratio, parent controls the size.
	let resolved_aspect_ratio = $derived(
		aspect_ratio === 'intrinsic'
			? (node.width && node.height ? `${node.width} / ${node.height}` : fallback_aspect_ratio)
			: undefined
	);
</script>

<CustomProperty class={css_class} path={path}>
	<div
		contenteditable="false"
		style:aspect-ratio={resolved_aspect_ratio}
		class="overflow-hidden h-full"
		class:ew-bg-checkerboard={!node.src}
	>
		<Media {path} {mask} />
	</div>
</CustomProperty>
