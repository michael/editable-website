<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER } from '../tailwind_theme.js';
	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<div class="border-b border-(--foreground-subtle) [--layout-orientation:horizontal]">
		<div class="{TW_LIMITER} w-full">
			<div class="xl:border-l border-(--foreground-subtle)">
				<NodeArrayProperty
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 *:border-(--foreground-subtle) *:border-r *:border-b *:first:border-b-0 md:[&>*:nth-child(-n+2)]:border-b-0 lg:[&>*:nth-child(-n+2)]:border-b lg:[&>*:nth-child(-n+3)]:border-b-0"
					path={[...path, 'link_collection_items']}
				/>
			</div>
		</div>
	</div>
</Node>
