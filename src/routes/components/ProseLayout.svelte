<script>
	let { layout, children } = $props();

	const layouts = [layout_1, layout_2, layout_3];
	let current_layout = $derived(layouts[layout - 1]);
</script>

<!-- Layout 1: Left-aligned -->
{#snippet layout_1()}
	<div class="mx-auto max-w-7xl">
		<div class="max-w-4xl px-6 sm:px-15">
			{@render children()}
		</div>
	</div>
{/snippet}

<!-- Layout 2: Centered -->
{#snippet layout_2()}
	<div class="mx-auto max-w-7xl">
		<div class="mx-auto max-w-4xl px-6 text-center sm:px-15">
			{@render children()}
		</div>
	</div>
{/snippet}

<!-- Layout 3: Right-aligned -->
{#snippet layout_3()}
	<div class="mx-auto max-w-7xl grid grid-cols-3">
		<div class="col-span-3 pr-6 pl-20 sm:pr-15 md:col-span-2 md:col-start-2 md:pl-0">
			{@render children()}
		</div>
	</div>
{/snippet}

<div class="ew-prose layout-{layout}">
	{@render current_layout()}
</div>

<!-- <Node class="ew-prose layout-{layout}" {path}>
	{@const layouts = [layout_1, layout_2, layout_3]}
	{@render layouts[layout - 1]()}
</Node> -->

<!-- <style>
	.ew-prose
		padding-block: var(--prose-padding-block, 1rem);
	}
</style> -->
