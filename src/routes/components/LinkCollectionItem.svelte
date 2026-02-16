<script>
	import { getContext } from 'svelte';
	import { Node, CustomProperty, AnnotatedTextProperty } from 'svedit';
	import Image from './Image.svelte';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let item_index = $derived(typeof path[path.length - 1] === 'number' ? path[path.length - 1] : 0);
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

<Node class="link-collection-item group" {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block"
		use:reveal={{ delay: item_index * 150 }}
	>
		<CustomProperty path={[...path, 'image']}>
			<div
				contenteditable="false"
				style:aspect-ratio={4 / 3}
				style:border-radius="var(--image-border-radius)"
				class="w-full overflow-hidden select-none"
				class:ew-bg-checkerboard={(is_selected || !image_node.src) && svedit.editable}
			>
				<Image path={[...path, 'image']} />
			</div>
		</CustomProperty>
		<div class="pt-4">
			<AnnotatedTextProperty class="font-medium text-xs md:text-sm uppercase tracking-wider text-(--foreground) opacity-60 mb-2" path={[...path, 'preline']} placeholder="Preline" />
			<AnnotatedTextProperty class="{!svedit.editable ? 'title-underline' : ''} font-heading text-(--foreground) text-2xl lg:text-3xl text-balance pt-1" path={[...path, 'title']} placeholder="Title" />
			<AnnotatedTextProperty class="text-balance pt-2" path={[...path, 'description']} placeholder="Description" />
		</div>
	</svelte:element>
</Node>

<style>
	:global(.title-underline) {
		display: inline;
		background: linear-gradient(to left, var(--accent), var(--accent));
		background-size: 0 2px;
		background-position: 0 100%, 100% 100%;
		background-repeat: no-repeat;
		transition: background-size cubic-bezier(0.8, 0, 0.2, 1) 0.4s;
	}

	:global(.group:hover .title-underline) {
		background-size: 100% 2px;
	}
</style>
