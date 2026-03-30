<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
	import MediaProperty from './MediaProperty.svelte';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let item_index = $derived(typeof path[path.length - 1] === 'number' ? path[path.length - 1] : 0);
	let node = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
</script>

<Node class="link-collection-item group" {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block"
		use:reveal={{ delay: item_index * 150 }}
	>
		<div class="overflow-hidden" style:border-radius="var(--image-border-radius)">
			<MediaProperty path={[...path, 'media']} sizing="fit" fallback_aspect_ratio="4 / 3" />
		</div>
		<div class="pt-4">
			<AnnotatedTextProperty
				class="mb-2 text-xs tracking-widest text-(--foreground) uppercase opacity-60 md:text-sm"
				path={[...path, 'preline']}
				placeholder={svedit.editable ? 'Preline' : undefined}
			/>
			<AnnotatedTextProperty
				class="{!svedit.editable
					? 'title-underline'
					: ''} pt-1 font-sans text-2xl text-balance text-(--foreground) lg:text-3xl"
				path={[...path, 'title']}
				placeholder={svedit.editable ? 'Title' : undefined}
			/>
			<AnnotatedTextProperty
				class="pt-2 text-balance"
				path={[...path, 'description']}
				placeholder={svedit.editable ? 'Description' : undefined}
			/>
		</div>
	</svelte:element>
</Node>

<style>
	:global(.title-underline) {
		display: inline;
		background: linear-gradient(to left, var(--accent), var(--accent));
		background-size: 0 2px;
		background-position:
			0 100%,
			100% 100%;
		background-repeat: no-repeat;
		transition: background-size cubic-bezier(0.8, 0, 0.2, 1) 0.4s;
	}

	:global(.group:hover .title-underline) {
		background-size: 100% 2px;
	}
</style>
