<script>
	import { getContext } from 'svelte';
	import { CustomProperty } from 'svedit';
	import Media from './Media.svelte';

	const svedit = getContext('svedit');

	/**
	 * @type {{
	 *   path: any[],
	 *   class?: string
	 * }}
	 */
	let {
		path,
		class: css_class = ''
	} = $props();
	let node = $derived(svedit.session.get(path));

	let is_selected = $derived(is_property_selected());

	function is_property_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const this_path = path.join('.');
		return path_of_selection === this_path;
	}
</script>

<CustomProperty class="block absolute! inset-0 {css_class}" path={path}>
	<div
		contenteditable="false"
		class="overflow-hidden h-full w-full"
		class:ew-bg-checkerboard={is_selected || !node.src}
	>
		<Media {path} />
	</div>
</CustomProperty>
