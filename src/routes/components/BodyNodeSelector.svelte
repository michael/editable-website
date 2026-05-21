<script>
	import { getContext } from 'svelte';
	import { serialize_path } from 'svedit';
	import { get_body_node_selector } from './body_node_selector_context.svelte.js';

	const svedit = getContext('svedit');
	const body_node_selector = get_body_node_selector();

	let page_id = $derived(svedit.session.doc.document_id);
	let page_node = $derived(svedit.session.get([page_id]));
	let body_node_targets = $derived(get_body_node_targets());

	function get_body_node_targets() {
		if (!Array.isArray(page_node?.body)) return [];

		return page_node.body
			.map((node_id, index) => {
				const node = svedit.session.get([node_id]);
				if (!node) return null;

				return {
					node,
					path: [page_id, 'body', index]
				};
			})
			.filter(Boolean);
	}

	function handle_keydown(event) {
		if (event.key !== 'Escape') return;

		event.preventDefault();
		event.stopPropagation();
		body_node_selector.close();
		svedit.focus_canvas();
	}

	function handle_pointerdown(event) {
		event.preventDefault();
		event.stopPropagation();
	}

	function handle_click(event, node) {
		event.preventDefault();
		event.stopPropagation();
		body_node_selector.handle_node_selected(node);
	}
</script>

<svelte:document onkeydown={handle_keydown} />

{#each body_node_targets as target (target.node.id)}
	<button
		type="button"
		class="body-node-selector-target group"
		style="position-anchor: --{serialize_path(target.path)};"
		aria-label="Click to link to this Slide"
		onpointerdown={handle_pointerdown}
		onpointerenter={() => body_node_selector.set_hovered_node(target.node.id)}
		onpointerleave={() => body_node_selector.set_hovered_node(null)}
		onfocus={() => body_node_selector.set_hovered_node(target.node.id)}
		onblur={() => body_node_selector.set_hovered_node(null)}
		onclick={(event) => handle_click(event, target.node)}
	>
		{#if body_node_selector.state.hovered_node_id === target.node.id}
			<span
				class="pointer-events-none absolute left-4 top-4 border border-(--svedit-editing-stroke) bg-(--background) px-3 py-2 text-sm font-medium text-(--foreground) shadow-xl"
			>
				Click to link to this Slide
			</span>
		{/if}
	</button>
{/each}

<style>
	.body-node-selector-target {
		appearance: none;
		position: absolute;
		top: anchor(top);
		left: anchor(left);
		bottom: anchor(bottom);
		right: anchor(right);
		z-index: 50;
		margin: 0;
		padding: 0;
		cursor: pointer;
		border: 1px solid transparent;
		background: transparent;
		pointer-events: auto;
		text-align: left;
	}

	.body-node-selector-target:hover,
	.body-node-selector-target:focus-visible {
		border-color: var(--svedit-editing-stroke);
		background: var(--svedit-editing-fill);
		outline: 2px solid var(--svedit-editing-stroke);
		outline-offset: -2px;
	}
</style>
