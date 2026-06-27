<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');
	let { children, ...rest } = $props();

	const bracket_class =
		'pointer-events-none absolute left-5 right-5 z-1 h-4 select-none sm:left-7 sm:right-7';
	const corner_class =
		'absolute size-3.5 border-(--svedit-canvas-stroke)';
</script>

<section {...rest}>
	{#if svedit.editable}
		<div class="relative">
			<div class="{bracket_class} top-4" contenteditable="false" aria-hidden="true">
				<div class="{corner_class} top-0 left-0 border-t border-l"></div>
				<div class="{corner_class} top-0 right-0 border-t border-r"></div>
			</div>
		</div>
	{/if}
	{#if children}
		{@render children()}
	{/if}
	{#if svedit.editable}
		<div class="relative">
			<div class="{bracket_class} bottom-4" contenteditable="false" aria-hidden="true">
				<div class="{corner_class} bottom-0 left-0 border-b border-l"></div>
				<div class="{corner_class} right-0 bottom-0 border-r border-b"></div>
			</div>
		</div>
	{/if}
</section>
