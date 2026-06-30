<script>
	import { getContext } from 'svelte';
	import { NodeArrayProperty, Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let column_count = $derived(node.footer_link_columns.nodes.length);
	let grid_cols_class = $derived(
		column_count <= 1
			? 'lg:grid-cols-1'
			: column_count === 2
				? 'lg:grid-cols-2'
				: column_count === 3
					? 'lg:grid-cols-3'
					: 'lg:grid-cols-4'
	);
</script>

<Node {path} class="text-sm text-(--foreground)">
	<div class={TW_LIMITER}>
		<div
			class="flex flex-col items-start gap-10 py-10 text-left sm:gap-14 lg:flex-row lg:items-stretch lg:gap-7 lg:py-24 {TW_PAGE_PADDING_X}"
		>
			<NodeArrayProperty
				class="flex flex-col gap-5 [--row:0] sm:gap-7 lg:w-1/3"
				path={[...path, 'content']}
			/>
			<NodeArrayProperty
				class="footer-columns grid grid-cols-1 gap-x-5 gap-y-8 [--row:1] {grid_cols_class} flex-1 sm:gap-x-7 sm:gap-y-10 lg:gap-y-7"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
