<script>
	import { getContext } from 'svelte';
	import { Node, CustomProperty, NodeArrayProperty } from 'svedit';
	import Image from './Image.svelte';
	import { TW_PAGE_PADDING, TW_MOBILE_LEFT_INSET, TW_LIMITER } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let image_node = $derived(svedit.session.get([...path, 'image']));
	let is_selected = $derived(is_image_selected());

	function is_image_selected() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const _image_path = [...path, 'image'].join('.');
		return path_of_selection == _image_path;
	}
</script>

<!-- Primitives -->
{#snippet image(aspect_ratio)}
	<CustomProperty class="ew-image-property" path={[...path, 'image']}>
		<div
			contenteditable="false"
			style:aspect-ratio={aspect_ratio}
			class="ew-image-wrapper h-full w-full overflow-hidden select-none"
			class:ew-bg-checkerboard={is_selected || !image_node.src}
		>
			<Image path={[...path, 'image']} />
		</div>
	</CustomProperty>
{/snippet}

{#snippet intro()}
	<NodeArrayProperty
		class="ew-feature-intro space-y-8"
		path={[...path, 'intro']}
	/>
{/snippet}

{#snippet outro()}
	<NodeArrayProperty
		class="ew-feature-outro space-y-5 md:space-y-8"
		path={[...path, 'outro']}
	/>
{/snippet}

<!-- Default layout for Feature -->
{#snippet layout_1()}
	<div class="{TW_LIMITER}">
		<div class="grid grid-cols-1 md:grid-cols-2 border-r border-l border-(--foreground-subtle)">
			<div class="flex flex-col {TW_PAGE_PADDING} pb-0">
				<div class="">{@render intro()}</div>
				<div class="flex-1" contenteditable="false">&ZeroWidthSpace;</div>
				<div class="">
					{@render outro()}
				</div>
			</div>
			<div class="{TW_PAGE_PADDING} md:border-l border-(--foreground-subtle)">
				{@render image(3 / 4)}
			</div>
		</div>
	</div>
{/snippet}

<!-- Like layout 1 but flipped horizontally -->
{#snippet layout_2()}
	<!-- Limiter -->
	<div class="{TW_LIMITER}">
		<div class="grid grid-cols-2 border-r border-l border-(--foreground-subtle)">
			<div class="border-r p-15 border-(--foreground-subtle)">
				{@render image(3 / 4)}
			</div>
			<div class="flex flex-col p-15">
				{@render intro()}
				<div class="flex-1" contenteditable="false"></div>
				{@render outro()}
			</div>
		</div>
	</div>
{/snippet}

<!-- Like layout 1 but image stretches to edges -->
{#snippet layout_3()}
	<div class="mx-auto grid max-w-7xl grid-cols-2">
		<div>
			{@render image(3 / 4)}
		</div>
		<div class="flex flex-col p-15">
			{@render intro()}
			<div class="flex-1" contenteditable="false"></div>
			{@render outro()}
		</div>
	</div>
{/snippet}

<!-- Like layout 2 but, but image stretches to edges -->
{#snippet layout_4()}
	<div class="mx-auto grid max-w-7xl grid-cols-2">
		<div class="flex flex-col p-15">
			{@render intro()}
			<div class="flex-1" contenteditable="false"></div>
			{@render outro()}
		</div>
		<div>
			{@render image(3 / 4)}
		</div>
	</div>
{/snippet}

<!-- Like layout 1 but title (small) + description aligned at top -->
{#snippet layout_5()}
	<div class="mx-auto grid max-w-7xl grid-cols-2">
		<div class="flex flex-col p-15">
			<div class="flex-1" contenteditable="false"></div>
			{@render intro()}
			<div class="pt-4">{@render outro()}</div>
		</div>
		<div class="p-15">
			{@render image(3 / 4)}
		</div>
	</div>
{/snippet}

<!-- Like layout 2 but title (small) + description aligned at bottom -->
{#snippet layout_6()}
	<div class="mx-auto grid max-w-7xl grid-cols-2">
		<div class="p-15">
			{@render image(3 / 4)}
		</div>
		<div class="flex flex-col p-15">
			{@render intro()}
			<div class="pt-4">{@render outro()}</div>
			<div class="flex-1" contenteditable="false"></div>
		</div>
	</div>
{/snippet}

<Node class="ew-feature lg:text-lg border-b border-(--foreground-subtle)" {path}>
	{@const layouts = [layout_1, layout_2, layout_3, layout_4, layout_5, layout_6]}
	{@render layouts[node.layout - 1]()}
</Node>
