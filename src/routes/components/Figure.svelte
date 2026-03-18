<script>
	import { getContext } from 'svelte';
	import { Node, CustomProperty } from 'svedit';
	import Image from './Image.svelte';
	import Video from './Video.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let image_node = $derived(svedit.session.get([...path, 'image']));
	let aspect_ratio = $derived(
		image_node.width && image_node.height
			? `${image_node.width} / ${image_node.height}`
			: '16 / 9'
	);

	let is_selected = $derived(is_image_selected());

	function is_image_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const _image_path = [...path, 'image'].join('.');
		return path_of_selection == _image_path;
	}
</script>

<Node {path}>
	<div>
		<div class="figure mx-auto w-full max-w-5xl py-16">
			<CustomProperty path={[...path, 'image']}>
				<div
					contenteditable="false"
					class="overflow-hidden"
					style:aspect-ratio={aspect_ratio}
					class:ew-bg-checkerboard={is_selected || !image_node.src}
				>
					{#if image_node.type === 'video'}
						<Video path={[...path, 'image']} />
					{:else}
						<Image path={[...path, 'image']} />
					{/if}
				</div>
			</CustomProperty>
		</div>
	</div>
</Node>
