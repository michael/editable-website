<script>
	import { getContext } from 'svelte';
	import { Node, TextProperty } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
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
			<TextProperty
				class="body-base {node.href ? 'underline underline-offset-2' : ''}"
				path={[...path, 'title']}
				placeholder="Title"
			/>
			<TextProperty
				class="pt-1 body-sm text-(--foreground)/50"
				path={[...path, 'description']}
				placeholder="Description"
			/>
		</div>
	</svelte:element>
</Node>
