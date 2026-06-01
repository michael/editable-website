<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { reveal } from '../reveal.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let render_as_link = $derived(!svedit.editable && node.href);
	let show_title_underline = $derived(!svedit.editable && !!node.href);
	let display_meta = $derived(svedit.editable || !!node.meta?.text?.trim());
</script>

<Node class="descriptive-listing-item group" {path}>
	<svelte:element
		this={render_as_link ? 'a' : 'div'}
		href={render_as_link ? node.href : undefined}
		target={render_as_link ? node.target : undefined}
		class="block border-b border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] py-4 outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke) sm:py-5 md:py-6"
		use:reveal
	>
		<div class="flex items-center justify-between gap-6">
			<div class="min-w-0 flex-1">
				<AnnotatedTextProperty
					class="{show_title_underline
						? 'underline decoration-1 underline-offset-[0.12em]'
						: ''} font-serif text-2xl text-balance text-(--foreground)"
					path={[...path, 'title']}
					placeholder="Title"
				/>
				<AnnotatedTextProperty
					class="block pt-0.5 text-base text-[color-mix(in_oklch,var(--foreground)_50%,transparent)]"
					path={[...path, 'description']}
					placeholder="Description"
				/>
			</div>

			{#if display_meta}
				<div class="min-w-0 shrink-0 self-center text-right">
					<AnnotatedTextProperty
						class="block text-base text-[color-mix(in_oklch,var(--foreground)_50%,transparent)]"
						path={[...path, 'meta']}
						placeholder="Meta"
					/>
				</div>
			{/if}
		</div>
	</svelte:element>
</Node>
