<script>
	import { getContext } from 'svelte';
	import { Node, CustomProperty, AnnotatedTextProperty } from 'svedit';
	import Image from './Image.svelte';
	import { TW_PAGE_PADDING } from '../tailwind_theme.js';

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

<Node class="link-collection-item" {path}>
	<svelte:element
		this={svedit.editable ? 'div' : 'a'}
		href={svedit.editable ? undefined : node.href}
		target={svedit.editable ? undefined : node.target}
		class="block"
	>
		<div class="{TW_PAGE_PADDING} pb-0!">
			<CustomProperty path={[...path, 'image']}>
				<div
					contenteditable="false"
					style:aspect-ratio={4 / 3}
					class="w-full overflow-hidden select-none"
					class:ew-bg-checkerboard={(is_selected || !image_node.src) && svedit.editable}
				>
					<Image path={[...path, 'image']} />
				</div>
			</CustomProperty>
		</div>
		<div class="{TW_PAGE_PADDING} pt-0!">
			<AnnotatedTextProperty class="text-sm text-gray-500 pt-8" path={[...path, 'preline']} placeholder="Preline" />
			<AnnotatedTextProperty class="text-3xl text-balance pt-1" path={[...path, 'title']} placeholder="Title" />
			<AnnotatedTextProperty class="text-balance pt-2" path={[...path, 'description']} placeholder="Description" />
		</div>
	</svelte:element>
</Node>
