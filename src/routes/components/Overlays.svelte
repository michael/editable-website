<script>
	import { getContext } from 'svelte';
	import ImageControls from './ImageControls.svelte';
	import CreateLink from './CreateLink.svelte';

	const svedit = getContext('svedit');

	let node_array_selection_paths = $derived(get_node_array_selection_paths());
	let selected_property = $derived(
		svedit.session.selection?.type === 'property'
			? svedit.session.get(svedit.session.selection.path)
			: null
	);
	let is_image_selected = $derived(selected_property?.type === 'image');
	let selected_link_path = $derived(get_selected_link_path());
	let selected_link = $derived(selected_link_path ? svedit.session.get(selected_link_path) : null);

	function get_node_array_selection_paths() {
		const paths = [];
		const sel = svedit.session.selection;
		if (!sel) return;

		// Node selection. Not collapsed.
		if (sel.type === 'node' && sel.anchor_offset !== sel.focus_offset) {
			const start = Math.min(sel.anchor_offset, sel.focus_offset);
			const end = Math.max(sel.anchor_offset, sel.focus_offset);

			for (let index = start; index < end; index++) {
				paths.push([...sel.path, index]);
			}
			return paths;
		}
	}

	function get_selected_link_path() {
		const sel = svedit.session.selection;
		if (!sel || sel.type !== 'text') return null;

		const active_annotation = svedit.session.active_annotation('link');
		if (active_annotation) {
			const annotated_text = svedit.session.get(sel.path);

			const annotation_index = annotated_text.annotations.indexOf(active_annotation);
			return [...sel.path, 'annotations', annotation_index, 'node_id'];
		}
		return null;
	}
</script>

{#if svedit.session.selection?.type === 'property'}
	{#if is_image_selected}
		<div
			class="image-controls-overlay property-selection-overlay"
			style="position-anchor: --{svedit.session.selection.path.join('-')};"
		>
			{#if selected_property.src}
				<ImageControls path={svedit.session.selection.path} />
			{/if}
		</div>
	{:else}
		<div
			class="property-selection-overlay"
			style="position-anchor: --{svedit.session.selection.path.join('-')};"
		></div>
	{/if}
{/if}
<!-- Here we render  and other stuff that should lay atop of the canvas -->
<!-- NOTE: we are using CSS Anchor Positioning, which currently only works in the latest Chrome browser -->
{#if node_array_selection_paths}
	<!-- Render node selection fragments (one per selected node)-->
	{#each node_array_selection_paths as path (path.join('-'))}
		<div class="node-selection-fragment" style="position-anchor: --{path.join('-')};"></div>
	{/each}
{/if}

{#if selected_link_path}
	<div
		class="link-popover flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-md"
		style="position-anchor: --{selected_link_path.join('-')};"
	>
		<a
			href={selected_link?.href}
			target="_blank"
			class="block max-w-56 truncate text-gray-700 underline">{selected_link?.href}</a
		>
		<button
			aria-label="Remove Link"
			type="button"
			class="flex-shrink-0 cursor-pointer rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
			onclick={() => svedit.session.apply(svedit.session.tr.annotate_text('link'))}
		>
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	</div>
{/if}

{#if svedit.session.commands?.toggle_link?.show_prompt}
	<CreateLink />
{/if}

<style>
	/* This should be an exact overlay */
	.node-selection-fragment,
	.property-selection-overlay {
		position: absolute;
		background: var(--editing-fill-color);
		border: 1px solid var(--editing-stroke-color);

		top: anchor(top);
		left: anchor(left);
		bottom: anchor(bottom);
		right: anchor(right);
		pointer-events: none;
	}

	.image-controls-overlay {
		position: absolute;
		top: anchor(top);
		left: anchor(left);
		bottom: anchor(bottom);
		right: anchor(right);
		pointer-events: auto;
	}

	.link-popover {
		position: absolute;
		top: anchor(bottom);
		left: anchor(center);
		pointer-events: auto;
		transform: translateX(-50%) translateY(4px);
		z-index: 30;
	}
</style>
