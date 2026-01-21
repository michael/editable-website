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
	let render_as_link = $derived(!svedit.editable && node.href);

	function is_image_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const _image_path = [...path, 'image'].join('.');
		return path_of_selection == _image_path;
	}
</script>

<Node class="link-collection-item" {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block transition-all duration-150 ease-out"
		class:hover-effect={render_as_link}
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
			<AnnotatedTextProperty class="text-sm text-gray-400 pt-8 uppercase" path={[...path, 'preline']} placeholder="Preline" />
			<AnnotatedTextProperty class="font-bold text-xl md:text-2xl lg:text-3xl text-balance pt-1" path={[...path, 'title']} placeholder="Title" />
			<AnnotatedTextProperty class="text-balance pt-2" path={[...path, 'description']} placeholder="Description" />
		</div>
	</svelte:element>
</Node>

<style>
	.hover-effect:hover {
		box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.12);
	}
	.hover-effect:active {
		box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.18);
	}
</style>
