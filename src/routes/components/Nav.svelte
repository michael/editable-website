<script>
	import { getContext } from 'svelte';
	import { NodeArrayProperty, Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	let { path } = $props();
</script>

<Node {path}>
	<div class="{TW_LIMITER}">
		<div class="flex items-stretch border-l border-r border-gray-400">
			<div class="w-1/4 flex items-center {TW_PAGE_PADDING_X} py-4">
				<span class="text-2xl font-extralight tracking-wide">LOGO</span>
			</div>
			<NodeArrayProperty class="nav-items flex items-stretch flex-1" path={[...path, 'nav_items']} />
		</div>
	</div>
</Node>

<style>
	:global(.nav-items) {
		--layout-orientation: horizontal;
	}

	:global(.nav-items > *) {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		border-left: 1px solid rgb(156, 163, 175);
		text-align: center;
	}


</style>
