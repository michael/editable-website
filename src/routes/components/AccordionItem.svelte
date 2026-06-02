<script>
	import { getContext } from 'svelte';
	import { Node, AnnotatedTextProperty, NodeArrayProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();

	function toggle_details(event) {
		event.preventDefault();
		event.stopPropagation();
		const details = event.currentTarget.closest('details');
		if (details) details.open = !details.open;
	}
</script>

<Node class="ew-accordion-item" {path}>
	<details
		class="border-b border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] py-4 sm:py-5 md:py-6"
	>
		<summary
			class="list-none outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
			class:pointer-events-none={svedit.editable}
			class:cursor-pointer={!svedit.editable}
		>
			<div class="flex items-center justify-between gap-4">
				<div class="min-w-0">
					<AnnotatedTextProperty
						class="inline font-serif text-2xl text-balance text-(--foreground)"
						path={[...path, 'title']}
						placeholder="Title"
					/>
				</div>
				<button
					type="button"
					class="pointer-events-auto shrink-0 text-[color-mix(in_oklch,var(--foreground)_60%,transparent)] outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
					aria-label="Toggle accordion item"
					onclick={toggle_details}
				>
					<svg class="accordion-chevron size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path
							d="M5 7.5L10 12.5L15 7.5"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</div>
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

	:global(.ew-accordion-item .accordion-chevron) {
		transition: transform 0.2s ease;
	}

	:global(.ew-accordion-item details[open] .accordion-chevron) {
		transform: rotate(180deg);
	}
</style>
