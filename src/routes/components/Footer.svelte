<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));

	let logo_node = $derived(svedit.session.get([...path, 'logo']));
	// Intrinsic CSS-pixel width: divide the raw pixel width by 2 for retina.
	// SVGs use their viewBox dimensions directly (no retina scaling).
	// Default to 72px when no image is set yet, to hint that this is for small decorative elements.
	const DEFAULT_WIDTH = 72;
	let is_svg = $derived(logo_node.mime_type === 'image/svg+xml');
	let css_width = $derived(
		logo_node.width
			? (is_svg ? logo_node.width : Math.round(logo_node.width / 2))
			: DEFAULT_WIDTH
	);

	$inspect(css_width);

	let wrapper_style = $derived(
		logo_node.src
			? `max-width: ${css_width}px`
			: `width: ${css_width}px`
	);

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
		<div class="flex flex-col items-center text-center lg:text-left lg:flex-row lg:items-start gap-8 lg:gap-12 py-10 lg:py-16 {TW_PAGE_PADDING_X}">
			<div class="flex flex-col items-center lg:items-start lg:w-1/3">
				<svelte:element
					this={svedit.editable ? 'div' : 'a'}
					href={svedit.editable ? undefined : '/'}
				>
					<div class="overflow-hidden" style="{wrapper_style}; border-radius: var(--image-border-radius);">
						<MediaProperty path={[...path, 'logo']} aspect_ratio="intrinsic" fallback_aspect_ratio="1 / 1" />
					</div>
				</svelte:element>
				<AnnotatedTextProperty
					class="mt-6 mb-0 lg:mb-0"
					path={[...path, 'copyright']}
					placeholder="© 2025 Company"
				/>
			</div>
			<NodeArrayProperty
				class="footer-columns grid grid-cols-1 {grid_cols_class} flex-1 gap-x-8 gap-y-6 lg:gap-y-12 [--row:1]"
				path={[...path, 'footer_link_columns']}
			/>
		</div>
	</div>
</Node>
