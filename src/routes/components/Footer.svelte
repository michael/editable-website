<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node, CustomProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import Image from './Image.svelte';

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

<Node {path} class="border-t border-(--foreground-subtle) text-sm">
	<div class="{TW_LIMITER}">
		<div class="flex flex-col md:flex-row md:items-start border-l border-r border-(--foreground-subtle) py-12 md:py-16 {TW_PAGE_PADDING_X}">
			<div class="md:w-1/3 flex flex-col items-start">
				<CustomProperty path={[...path, 'logo']}>
					<div class="h-18 w-10 overflow-hidden mb-4" contenteditable="false">
						<Image path={[...path, 'logo']} />
					</div>
				</CustomProperty>
				<AnnotatedTextProperty
					class="mb-8 md:mb-0"
					path={[...path, 'copyright']}
					placeholder="© 2025 Company"
				/>
			</div>
			<NodeArrayProperty
				class="footer-columns grid grid-cols-2 {grid_cols_class} flex-1 gap-x-8 gap-y-12 mt-8 md:mt-0 [--layout-orientation:horizontal]"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
