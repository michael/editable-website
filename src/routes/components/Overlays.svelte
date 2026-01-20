<script>
	import { getContext } from 'svelte';
	import ImageControls from './ImageControls.svelte';
	import CreateLink from './CreateLink.svelte';
	import LinkPreview from './LinkPreview.svelte';

	const svedit = getContext('svedit');

	let node_array_selection_paths = $derived(get_node_array_selection_paths());
	let selected_property = $derived(
		svedit.session.selection?.type === 'property'
			? svedit.session.get(svedit.session.selection.path)
			: null
	);
	let is_image_selected = $derived(selected_property?.type === 'image');
	let link_preview = $derived(get_link_preview());

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

	function get_link_preview() {
		const sel = svedit.session.selection;
		if (!sel) return null;

		// Check if selected_node has an href property (link-ish node)
		const selected_node = svedit.session.selected_node;
		if (selected_node && 'href' in selected_node) {
			// For node selections, check if exactly one node is selected
			if (sel.type === 'node') {
				const start = Math.min(sel.anchor_offset, sel.focus_offset);
				const end = Math.max(sel.anchor_offset, sel.focus_offset);
				if (end - start === 1) {
					const path = [...sel.path, start];
					return { node: selected_node, path };
				}
			}

			// For text/property selections inside a link-ish node
			if (sel.type === 'text' || sel.type === 'property') {
				// Path to the node is selection path minus the property name
				const path = sel.path.slice(0, -1);
				return { node: selected_node, path };
			}
		}

		// Check for inline link annotation
		if (sel.type === 'text') {
			const active_annotation = svedit.session.active_annotation('link');
			if (active_annotation) {
				const annotated_text = svedit.session.get(sel.path);
				const annotation_index = annotated_text.annotations.indexOf(active_annotation);
				const link_node = svedit.session.get(active_annotation.node_id);
				const path = [...sel.path, 'annotations', annotation_index, 'node_id'];
				return { node: link_node, path };
			}
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

{#if link_preview}
	<LinkPreview node={link_preview.node} path={link_preview.path} />
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
</style>