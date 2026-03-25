<script>
	import { getContext } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X, TW_BLOCK_PADDING_Y } from '../tailwind_theme.js';

	const svedit = getContext('svedit');
	let { path } = $props();

	function add_row() {
		const session = svedit.session;
		const items_path = [...path, 'items'];
		const current_items = session.get(items_path) ?? [];
		const new_item_id = session.config.generate_id();
		const tr = session.tr;

		tr.create({
			id: new_item_id,
			type: 'highlight_item',
			label: { text: '', annotations: [] },
			value: { text: '', annotations: [] }
		});

		tr.set(items_path, [...current_items, new_item_id]);
		tr.set_selection({
			type: 'node',
			path: items_path,
			anchor_offset: current_items.length,
			focus_offset: current_items.length + 1
		});
		session.apply(tr);
	}
</script>

<Node class="ew-highlights bg-(--background) text-(--foreground)" {path}>
	<div class={TW_LIMITER}>
		<div class={TW_BLOCK_PADDING_Y}>
			<div class={TW_PAGE_PADDING_X}>
				<NodeArrayProperty
					tag="ul"
					class="highlights-list flex flex-wrap justify-between gap-x-8 gap-y-3 [--row:1] list-none"
					path={[...path, 'items']}
				/>
				{#if svedit.editable}
					<button
						class="mt-4 border border-(--foreground) px-3 py-2 text-xs uppercase tracking-[0.2em] text-(--foreground) transition-colors duration-150 hover:bg-(--foreground) hover:text-(--background)"
						type="button"
						onclick={add_row}
					>
						Add row
					</button>
				{/if}
			</div>
		</div>
	</div>
</Node>
