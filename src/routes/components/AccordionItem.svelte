<script>
	import { Node, AnnotatedTextProperty, NodeArrayProperty } from 'svedit';

	let { path } = $props();
</script>

<Node class="ew-accordion-item" {path}>
	<details
		class="border-b border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] py-4 sm:py-5 md:py-6"
	>
		<summary
			class="cursor-pointer list-none outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
		>
			<AnnotatedTextProperty
				class="inline font-serif text-2xl text-balance text-(--foreground)"
				path={[...path, 'title']}
				placeholder="Title"
			/>
		</summary>
		<div class="pt-3">
			<NodeArrayProperty class="flex flex-col gap-5 md:gap-8" path={[...path, 'body']} />
		</div>
	</details>
</Node>

<style>
	:global(.ew-accordion-item summary::-webkit-details-marker) {
		display: none;
	}

	:global(.ew-accordion-item summary::marker) {
		content: '';
	}
</style>
