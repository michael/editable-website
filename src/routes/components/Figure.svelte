<script>
	import { getContext } from 'svelte';
	import { Node, CustomProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import Image from './Image.svelte';
	import Video from './Video.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, 'media']));
	let aspect_ratio = $derived(
		media_node.width && media_node.height
			? `${media_node.width} / ${media_node.height}`
			: '16 / 9'
	);

	let is_selected = $derived(is_media_selected());

	function is_media_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const _media_path = [...path, 'media'].join('.');
		return path_of_selection == _media_path;
	}
</script>

<Node {path}>
	<div class="{TW_LIMITER}">
		<div class="figure {TW_PAGE_PADDING_X} py-16">
			<CustomProperty path={[...path, 'media']}>
				<div
					contenteditable="false"
					style:border-radius="var(--image-border-radius)"
					style:aspect-ratio={aspect_ratio}
					class="overflow-hidden"
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
	</div>
</Node>