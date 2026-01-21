<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let column_count = $derived(node.footer_link_columns?.length || 0);
	let grid_cols_class = $derived(
		column_count <= 1 ? 'lg:grid-cols-1' :
		column_count === 2 ? 'lg:grid-cols-2' :
		column_count === 3 ? 'lg:grid-cols-3' :
		'lg:grid-cols-4'
	);
</script>

<Node {path} class="border-t border-b border-gray-400">
	<div class="{TW_LIMITER}">
		<div class="flex flex-col md:flex-row md:items-stretch border-l border-r border-gray-400">
			<div class="order-2 md:order-1 md:w-1/4 flex items-center justify-center md:justify-start {TW_PAGE_PADDING_X} py-4 border-t md:border-t-0 border-gray-400">
				<AnnotatedTextProperty
					class="text-center md:text-left"
					path={[...path, 'copyright']}
					placeholder="© 2025 Company"
				/>
			</div>
			<NodeArrayProperty
				class="footer-columns order-1 md:order-2 grid grid-cols-2 {grid_cols_class} flex-1 [--layout-orientation:horizontal] *:flex *:flex-col *:border-l *:border-gray-400 max-md:*:border-t max-md:[&>*:nth-child(1)]:border-t-0 max-md:[&>*:nth-child(2)]:border-t-0 max-md:[&>*:nth-child(odd)]:border-l-0 max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*:nth-child(n+5)]:border-t"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
<div class="{TW_LIMITER} w-full">
	<div class="h-12 border-l border-r border-gray-400"></div>
</div>
