<script>
	import { getContext } from 'svelte';
	import { CustomProperty, serialize_path } from 'svedit';
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
		const path_of_selection = svedit?.session?.selection?.path;
		return path_of_selection && serialize_path(path_of_selection) === serialize_path(path);
	}
</script>

<CustomProperty class="h-full {css_class}" path={path}>
	<div
		contenteditable="false"
		class="overflow-hidden h-full"
		class:ew-bg-checkerboard={is_selected || !node.src}
	>
		<Media {node} editable={svedit.editable} />
	</div>
</CustomProperty>