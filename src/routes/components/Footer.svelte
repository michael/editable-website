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
		'lg:grid-cols-3'
	);
</script>

<Node {path} class="lg:text-lg">
	<div class="{TW_LIMITER}">
		<div class="flex flex-col items-center text-center lg:text-left lg:flex-row lg:items-start border-l border-r border-(--border-color) py-10 lg:py-16 {TW_PAGE_PADDING_X}">
			<div class="flex flex-col items-center lg:items-start lg:w-1/3">
				<CustomProperty path={[...path, 'logo']}>
					<svelte:element
						this={svedit.editable ? 'div' : 'a'}
						href={svedit.editable ? undefined : '/'}
						class="h-18 w-18 overflow-hidden block"
						contenteditable={svedit.editable ? 'false' : undefined}
					>
						<Image path={[...path, 'logo']} mask={true} />
					</svelte:element>
				</CustomProperty>
				<AnnotatedTextProperty
					class="mt-6 mb-0 lg:mb-0"
					path={[...path, 'copyright']}
					placeholder="© 2025 Company"
				/>
			</div>
			<NodeArrayProperty
				class="footer-columns grid grid-cols-1 {grid_cols_class} flex-1 gap-x-8 gap-y-6 lg:gap-y-12 mt-12 lg:mt-0 [--is-horizontal:1]"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
