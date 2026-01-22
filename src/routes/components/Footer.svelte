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

<Node {path} class="border-t border-b border-(--foreground-subtle)">
	<div class="{TW_LIMITER}">
		<div class="flex flex-col md:flex-row md:items-stretch border-l border-r border-(--foreground-subtle)">
			<div class="order-2 md:order-1 md:w-1/4 flex flex-col justify-center md:items-start items-center {TW_PAGE_PADDING_X} py-4 border-t md:border-t-0 border-(--foreground-subtle)">
				<CustomProperty path={[...path, 'logo']}>
					<div class="h-10 w-10 overflow-hidden mb-4" contenteditable="false">
						<Image path={[...path, 'logo']} />
					</div>
				</CustomProperty>
				<AnnotatedTextProperty
					class="text-center md:text-left"
					path={[...path, 'copyright']}
					placeholder="© 2025 Company"
				/>
			</div>
			<NodeArrayProperty
				class="footer-columns order-1 md:order-2 grid grid-cols-2 {grid_cols_class} flex-1 [--layout-orientation:horizontal] *:flex *:flex-col *:border-l *:border-(--foreground-subtle) max-md:*:border-t max-md:[&>*:nth-child(1)]:border-t-0 max-md:[&>*:nth-child(2)]:border-t-0 max-md:[&>*:nth-child(odd)]:border-l-0 max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*:nth-child(n+5)]:border-t"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
<div class="{TW_LIMITER} w-full">
	<div class="h-12 border-l border-r border-(--foreground-subtle)"></div>
</div>
