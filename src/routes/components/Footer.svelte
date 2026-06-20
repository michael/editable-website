<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import MediaProperty from './MediaProperty.svelte';
	import SizableViewbox from './SizableViewbox.svelte';

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

<Node {path} class="text-sm text-(--foreground)">
	<div class="{TW_LIMITER}">
		<div class="flex flex-col items-center text-center lg:text-left lg:flex-row lg:items-stretch gap-5 sm:gap-7 py-10 lg:py-24 {TW_PAGE_PADDING_X}">
			<div class="flex flex-col items-center lg:items-start lg:self-stretch lg:justify-between lg:w-1/3">
				<SizableViewbox {path} media_property="logo" placeholder_aspect_ratio={1}>
					<svelte:element
						class="block w-full h-full outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:-outline-offset-1"
						this={svedit.editable ? 'div' : 'a'}
						href={svedit.editable ? undefined : '/'}
					>
						<MediaProperty path={[...path, 'logo']} />
					</svelte:element>
				</SizableViewbox>
				<AnnotatedTextProperty
					class="body-base text-(--foreground)/50 mt-6 mb-0 lg:mb-0"
					path={[...path, 'copyright']}
					placeholder='© 2025 Your company'
				/>
			</div>
			<NodeArrayProperty
				class="[--row:1] footer-columns grid grid-cols-1 {grid_cols_class} flex-1 gap-5 sm:gap-7"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
