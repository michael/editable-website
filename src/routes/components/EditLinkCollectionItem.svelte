<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	let is_visible = $derived(get_is_visible());
	let target_node = $derived(get_target_node());
	let href_input_value = $state('');
	let href_input_ref = $state();

	function get_is_visible() {
		const selection = svedit.session.selection;
		if (!selection) return false;

		// Check if selected_node is a link_collection_item
		const node = svedit.session.selected_node;
		if (node?.type !== 'link_collection_item') return false;

		// For node selections, check if exactly one node is selected
		if (selection.type === 'node') {
			const start = Math.min(selection.anchor_offset, selection.focus_offset);
			const end = Math.max(selection.anchor_offset, selection.focus_offset);
			return end - start === 1;
		}

		// For text/property selections inside a link_collection_item, show the popover
		return selection.type === 'text' || selection.type === 'property';
	}

	function get_target_node() {
		if (!is_visible) return null;
		return svedit.session.selected_node;
	}

	function get_target_path() {
		const selection = svedit.session.selection;
		if (!selection) return null;

		if (selection.type === 'node') {
			// Node selection - path points to node_array, offset gives position
			const index = Math.min(selection.anchor_offset, selection.focus_offset);
			return [...selection.path, index];
		} else {
			// Text or property selection - path is like [node_id, prop, index, 'title']
			// We need the path to the node: [node_id, prop, index]
			return selection.path.slice(0, -1);
		}
	}

	function save() {
		if (target_node) {
			const tr = svedit.session.tr;
			tr.set([target_node.id, 'href'], href_input_value);
			svedit.session.apply(tr);
		}
		svedit.focus_canvas();
	}

	function cancel() {
		svedit.focus_canvas();
	}

	function handle_keydown(event) {
		event.stopPropagation();

		if (event.key === 'Enter') {
			event.preventDefault();
			save();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			cancel();
		}
	}

	$effect(() => {
		if (is_visible && href_input_ref) {
			// Initialize with current href value
			href_input_value = target_node?.href || '';
			href_input_ref.focus();
			href_input_ref.select();
		}
	});
</script>

{#if is_visible}
	<div
		class="edit-link-collection-item-popover flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-md"
		style="position-anchor: --{get_target_path()?.join('-')};"
	>
		<label for="link-collection-item-href" class="text-gray-500">Link:</label>
		<input
			id="link-collection-item-href"
			bind:this={href_input_ref}
			type="url"
			bind:value={href_input_value}
			placeholder="https://example.com"
			class="w-48 rounded border border-gray-400 px-2 py-1 text-sm outline-none focus:border-blue-500"
			onkeydown={handle_keydown}
		/>
		<button
			type="button"
			class="cursor-pointer rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
			onclick={save}
		>
			Save
		</button>
		<button
			aria-label="Cancel"
			type="button"
			class="shrink-0 cursor-pointer rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
			onclick={cancel}
		>
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	</div>
{/if}

<style>
	.edit-link-collection-item-popover {
		position: absolute;
		position-area: block-end span-all;
		justify-self: anchor-center;
		margin-top: 4px;
		pointer-events: auto;
		z-index: 30;
		/*position-try-fallbacks: flip-block;*/
	}
</style>
