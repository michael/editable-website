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

<Node {path} class="border-t border-(--foreground-subtle)">
	<div class="{TW_LIMITER}">
		<div class="flex flex-col md:flex-row md:items-start border-l border-r border-(--foreground-subtle) py-12 md:py-16">
			<div class="md:w-1/4 flex flex-col md:items-start items-center {TW_PAGE_PADDING_X}">
				<CustomProperty path={[...path, 'logo']}>
					<div class="h-10 w-10 overflow-hidden mb-4" contenteditable="false">
						<Image path={[...path, 'logo']} />
					</div>
				</CustomProperty>
				<AnnotatedTextProperty
					class="text-center md:text-left text-(--foreground-muted)"
					path={[...path, 'copyright']}
					placeholder="© 2025 Company"
				/>
			</div>
			<NodeArrayProperty
				class="footer-columns grid grid-cols-2 {grid_cols_class} flex-1 gap-8 mt-8 md:mt-0 {TW_PAGE_PADDING_X} md:px-0 [--layout-orientation:horizontal]"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
