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

<Node {path} class="lg:text-lg">
	<div class="{TW_LIMITER}">
		<div class="flex flex-col md:flex-row md:items-start border-l border-r border-(--foreground-subtle) py-10 md:py-16 {TW_PAGE_PADDING_X}">
			<div class="md:w-1/3 flex flex-col items-start">
				<CustomProperty path={[...path, 'logo']}>
					<svelte:element
						this={svedit.editable ? 'div' : 'a'}
						href={svedit.editable ? undefined : '/'}
						class="h-18 w-18 overflow-hidden block"
						contenteditable={svedit.editable ? 'false' : undefined}
					>
						<Image path={[...path, 'logo']} />
					</svelte:element>
				</CustomProperty>
				<AnnotatedTextProperty
					class="mt-4 mb-0 md:mb-0"
					path={[...path, 'copyright']}
					placeholder="© 2025 Company"
				/>
			</div>
			<NodeArrayProperty
				class="footer-columns grid grid-cols-1 md:grid-cols-2 {grid_cols_class} flex-1 gap-x-8 gap-y-6 md:gap-y-12 mt-8 md:mt-0 [--layout-orientation:horizontal]"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
