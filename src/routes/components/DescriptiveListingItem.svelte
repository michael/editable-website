<script>
	import { getContext } from 'svelte';
	import { Node } from 'svedit';
	import Base from './Base.svelte';
	import Small from './Small.svelte';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
	let display_meta = $derived(svedit.editable || !!node.meta?.text?.trim());
</script>

<Node class="descriptive-listing-item group" {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block border-b border-[color-mix(in_oklch,var(--foreground)_7%,transparent)] py-4 outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke) sm:py-2 md:py-3"
		use:reveal
	>
		<div class="flex items-center justify-between gap-6">
			<div class="min-w-0 flex-1">
				<Base
					class={node.href ? "underline underline-offset-2 transition-all duration-1000 ease-in-out decoration-(--foreground)/15 group-hover:decoration-(--foreground)" : ""}
					path={[...path, 'title']}
					placeholder="Title"
				/>
				<Small
					class="text-(--foreground)/50 pt-1"
					path={[...path, 'description']}
					placeholder="Description"
				/>
			</div>

			{#if display_meta}
				<div class="min-w-0 shrink-0 self-center text-right">
					<Small
						class="text-(--foreground)/50 pt-1"
						path={[...path, 'meta']}
						placeholder="Meta"
					/>
				</div>
			{/if}
		</div>
	</svelte:element>
</Node>
