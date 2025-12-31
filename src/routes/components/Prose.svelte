<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let layout = $derived(node.layout || 1);
</script>

<!-- Layout 1: Left-aligned -->
{#snippet layout_1()}
	<div class="mx-auto max-w-7xl py-8 border-l border-r">
		<div class="max-w-4xl px-6 sm:px-15">
			<NodeArrayProperty path={[...path, 'content']} />
		</div>
	</div>
{/snippet}

<!-- Layout 2: Centered -->
{#snippet layout_2()}
	<div class="mx-auto max-w-7xl">
		<div class="mx-auto max-w-4xl px-6 text-center sm:px-15">
			<NodeArrayProperty path={[...path, 'content']} />
		</div>
	</div>
{/snippet}

<!-- Layout 3: Right-aligned -->
{#snippet layout_3()}
	<div class="mx-auto max-w-7xl grid grid-cols-3">
		<div class="col-span-3 pr-6 pl-20 sm:pr-15 md:col-span-2 md:col-start-2 md:pl-0">
			<NodeArrayProperty path={[...path, 'content']} />
		</div>
	</div>
{/snippet}

<Node class="ew-prose layout-{layout} border-t" {path}>
	{@const layouts = [layout_1, layout_2, layout_3]}
	{@render layouts[layout - 1]()}
</Node>
