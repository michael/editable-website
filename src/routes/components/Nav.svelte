<script>
	import { getContext } from 'svelte';
	import { NodeArrayProperty, Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	let { path } = $props();
</script>

<Node {path}>
	<div class="{TW_LIMITER}">
		<div class="text-sm text-gray-400 {TW_PAGE_PADDING_X} pt-4 pb-1">Menu</div>
		<div class="flex items-stretch border-t border-b border-gray-300 {TW_PAGE_PADDING_X}">
			<div class="flex items-center pr-8 py-4 border-r border-gray-300">
				<span class="text-2xl font-light tracking-wide">LOGO</span>
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
		border-right: 1px solid rgb(209, 213, 219);
		text-align: center;
	}

	:global(.nav-items > *:last-child) {
		border-right: none;
	}
</style>