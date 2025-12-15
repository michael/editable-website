<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty, CustomProperty } from 'svedit';
	import Image from './Image.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let image_node = $derived(svedit.session.get([...path, 'image']));
	let is_selected = $derived(is_image_selected());

	function is_image_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const _image_path = [...path, 'image'].join('.');
		return path_of_selection == _image_path;
	}
</script>

<Node class="gallery-item" {path}>
	<CustomProperty class="image-property" path={[...path, 'image']}>
		<!--
			We need a div with contenteditable="false" to wrap the image,
		  otherwise we get two additional cursor positions (before and after the image).
			And we can not set contenteditable="false" on the <CustomProperty> because then
			the cursor trap would not be reachable.
		-->
		<div
			contenteditable="false"
			class="image-wrapper h-full w-full overflow-hidden select-none"
			class:ew-bg-checkerboard={is_selected || !image_node.src}
		>
			<Image path={[...path, 'image']} />
		</div>
	</CustomProperty>
</Node>
