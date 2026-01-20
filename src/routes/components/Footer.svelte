<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
</script>

<Node {path} class="border-t border-b border-gray-400">
	<div class="{TW_LIMITER}">
		<div class="flex items-stretch border-l border-r border-gray-400">
			<div class="w-1/4 flex items-center {TW_PAGE_PADDING_X} py-4">
				<AnnotatedTextProperty
					class="text-sm text-gray-600"
					path={[...path, 'copyright']}
					placeholder="© 2025 Company"
				/>
			</div>
			<NodeArrayProperty
				class="footer-columns flex items-stretch flex-1"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
<div class="{TW_LIMITER} w-full">
	<div class="h-8 border-l border-r border-gray-400"></div>
</div>

<style>
	:global(.footer-columns) {
		--layout-orientation: horizontal;
	}

	:global(.footer-columns > *) {
		display: flex;
		flex-direction: column;
		flex: 1;
		border-left: 1px solid rgb(156, 163, 175);
	}
</style>