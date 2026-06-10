<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import Base from './Base.svelte';
	import Small from './Small.svelte';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
</script>

<Node class="descriptive-gallery-item group" {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
		use:reveal
	>
		<div
			class="overflow-hidden"
			style:aspect-ratio="4/3"
			style:border-radius="var(--image-border-radius)"
		>
			<MediaProperty path={[...path, 'media']} />
		</div>
		<div class="pt-4">
			<Base
				class={node.href ? "underline underline-offset-2 transition-all duration-500 ease-in-out decoration-(--foreground)/15 group-hover:decoration-(--foreground)" : ""}
				path={[...path, 'title']}
				placeholder="Title"
			/>
			<Small
				class="text-(--foreground)/50 pt-1"
				path={[...path, 'description']}
				placeholder="Description"
			/>
		</div>
	</svelte:element>
</Node>
