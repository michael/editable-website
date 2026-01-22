<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER } from '../tailwind_theme.js';
	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<div class="border-t border-(--foreground-subtle) [--layout-orientation:horizontal]">
		<div class="{TW_LIMITER} w-full">
			<div class="xl:border-l border-(--foreground-subtle)">
				<NodeArrayProperty
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 *:border-(--foreground-subtle) *:border-r *:border-t *:first:border-t-0 md:[&>*:nth-child(-n+2)]:border-t-0 lg:[&>*:nth-child(-n+2)]:border-t lg:[&>*:nth-child(-n+3)]:border-t-0"
					path={[...path, 'link_collection_items']}
				/>
			</div>
		</div>
	</div>
</Node>
