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
				? 'sm:grid-cols-2'
				: column_count === 3
					? 'sm:grid-cols-2 lg:grid-cols-3'
					: 'sm:grid-cols-2 lg:grid-cols-4'
	);
</script>

<Node {path} class="text-sm text-(--foreground)">
	<div class={TW_LIMITER}>
		<div
			class="flex flex-col items-stretch pt-48 pb-10 sm:pt-32 lg:py-32 lg:flex-row gap-y-10 sm:gap-y-14 gap-x-10 {TW_PAGE_PADDING_X}"
		>
			<NodeArrayProperty
				class="flex lg:w-1/3 flex-col gap-5 [--row:0] sm:gap-7"
				path={[...path, 'content']}
			/>
			<NodeArrayProperty
				class="grid grid-cols-1 [--row:1] {grid_cols_class} flex-1 gap-x-8 lg:gap-x-10 gap-y-10 lg:gap-y-12"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
