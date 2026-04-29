<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_BLOCK_PADDING_Y, TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let colorset_class = $derived(node.colorset ? `ew-colorset-${node.colorset}` : '');
</script>

<Node class="bg-(--background) text-(--foreground) {colorset_class}" {path}>
	<div class="{TW_LIMITER}">
		<div class="{TW_BLOCK_PADDING_Y}">
			<div class="{TW_PAGE_PADDING_X}">
				<div class="overflow-x-auto border-y border-(--foreground)/10 bg-[color-mix(in_oklch,var(--foreground)_8%,var(--background))] px-4 py-5 md:px-6 md:py-6">
					<NodeArrayProperty
						class="min-w-max font-mono text-sm leading-relaxed [&_p]:whitespace-pre [&_p]:text-nowrap"
						path={[...path, 'lines']}
					/>
				</div>
			</div>
		</div>
	</div>
</Node>