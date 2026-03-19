<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty, CustomProperty } from 'svedit';
	import Image from './Image.svelte';
	import Video from './Video.svelte';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let item_index = $derived(typeof path[path.length - 1] === 'number' ? path[path.length - 1] : 0);
	let node = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, 'media']));
	let is_selected = $derived(is_media_selected());

	function is_media_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const _media_path = [...path, 'media'].join('.');
		return path_of_selection == _media_path;
	}
</script>

<Node class="gallery-item" {path}>
  <div use:reveal={{ delay: item_index * 150 }}>
	<CustomProperty class="image-property" path={[...path, 'media']}>
		<!--
			We need a div with contenteditable="false" to wrap the image,
		  otherwise we get two additional cursor positions (before and after the image).
			And we can not set contenteditable="false" on the <CustomProperty> because then
			the cursor trap would not be reachable.
		-->
		<div
			contenteditable="false"
			style:border-radius="var(--image-border-radius)"
			class="image-wrapper h-full w-full overflow-hidden select-none"
			class:ew-bg-checkerboard={is_selected || !media_node.src}
		>
			{#if media_node.type === 'video'}
				<Video path={[...path, 'media']} />
			{:else}
				<Image path={[...path, 'media']} />
			{/if}
		</div>
	</CustomProperty>
  </div>
</Node>