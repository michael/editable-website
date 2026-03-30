<script>
	import { getContext } from 'svelte';
	import { touch_drag } from '$lib/client/touch_drag.js';

	const svedit = getContext('svedit');

	const MIN_WIDTH = 40;
	const MIN_HEIGHT = 20;
	const SNAP_THRESHOLD = 0.05; // snap to natural ratio when within 5%

	/**
	 * @type {{
	 *   path: any[],
	 *   media_property?: string,
	 *   placeholder_aspect_ratio?: number
	 * }}
	 */
	let {
		path,
		media_property = 'media',
		placeholder_aspect_ratio = 16 / 9
	} = $props();

	// Derive field names from media_property
	let max_width_field = $derived(`${media_property}_max_width`);
	let aspect_ratio_field = $derived(`${media_property}_aspect_ratio`);

	let node = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, media_property]));

	// The media's natural aspect ratio (or fallback)
	let natural_aspect_ratio = $derived(
		media_node?.width && media_node?.height
			? media_node.width / media_node.height
			: placeholder_aspect_ratio
	);

	// Resolve aspect ratio: 0 means use natural ratio
	let resolved_aspect_ratio = $derived(
		node[aspect_ratio_field] > 0
			? node[aspect_ratio_field]
			: natural_aspect_ratio
	);

	// Anchor name must match what SizableViewbox sets
	let anchor_name = $derived(`--viewbox-${path.join('-')}-${media_property}`);

	// --- Drag state (shared across all handles) ---
	let drag_type = null;
	let drag_start_x = 0;
	let drag_start_y = 0;
	let drag_start_max_width = 0;
	let drag_start_aspect_ratio = 0;
	let drag_container_width = 0;
	let drag_width_multiplier = 1;

	/** Find the viewbox element via its anchor name data attribute */
	function get_viewbox_el() {
		return document.querySelector(`[data-viewbox-anchor="${anchor_name}"]`);
	}

	function capture_width_state(side) {
		drag_type = side;

		const viewbox_el = get_viewbox_el();
		const rect = viewbox_el?.getBoundingClientRect();
		drag_start_max_width = node[max_width_field] > 0
			? node[max_width_field]
			: (rect?.width ?? 400);
		const parent_rect = viewbox_el?.parentElement?.getBoundingClientRect();
		drag_container_width = parent_rect?.width ?? drag_start_max_width;

		// Detect centering by comparing horizontal gaps to parent.
		// Works for both margin:auto and flex centering.
		if (viewbox_el && rect && parent_rect) {
			const gap_left = rect.left - parent_rect.left;
			const gap_right = parent_rect.right - rect.right;
			const total_gap = gap_left + gap_right;
			const is_centered = total_gap > 0
				&& Math.abs(gap_left - gap_right) < Math.max(5, total_gap * 0.1);
			drag_width_multiplier = is_centered ? 2 : 1;
		} else {
			drag_width_multiplier = 2;
		}
	}

	function capture_height_state() {
		drag_type = 'height';
		drag_start_aspect_ratio = resolved_aspect_ratio;

		const viewbox_el = get_viewbox_el();
		const rect = viewbox_el?.getBoundingClientRect();
		drag_start_max_width = rect?.width ?? 400;
	}

	function handle_move(client_x, client_y) {
		if (!drag_type) return;

		if (drag_type === 'width-left' || drag_type === 'width-right') {
			const dx = client_x - drag_start_x;
			const direction = drag_type === 'width-right' ? 1 : -1;
			const raw_width = Math.max(MIN_WIDTH, Math.round(drag_start_max_width + dx * direction * drag_width_multiplier));
			const new_width = Math.round(raw_width / 4) * 4;

			const tr = svedit.session.tr;
			tr.set([...path, max_width_field], new_width >= drag_container_width ? 0 : new_width);
			svedit.session.apply(tr, { batch: true });
		} else if (drag_type === 'height') {
			const dy = client_y - drag_start_y;
			const current_width = drag_start_max_width;
			const old_height = current_width / drag_start_aspect_ratio;
			const new_height = Math.max(MIN_HEIGHT, old_height + dy);
			const new_ratio = current_width / new_height;

			const snap = Math.abs(new_ratio - natural_aspect_ratio) / natural_aspect_ratio < SNAP_THRESHOLD;

			const tr = svedit.session.tr;
			tr.set([...path, aspect_ratio_field], snap ? 0 : Math.round(new_ratio * 1000) / 1000);
			svedit.session.apply(tr, { batch: true });
		}
	}

	function handle_up() {
		if (!drag_type) return;

		// Final non-batched apply for clean undo point
		if (drag_type === 'width-left' || drag_type === 'width-right') {
			const tr = svedit.session.tr;
			tr.set([...path, max_width_field], node[max_width_field]);
			svedit.session.apply(tr);
		} else if (drag_type === 'height') {
			const tr = svedit.session.tr;
			tr.set([...path, aspect_ratio_field], node[aspect_ratio_field]);
			svedit.session.apply(tr);
		}

		drag_type = null;
	}

	// --- One attachment per handle ---

	function width_drag(side) {
		return touch_drag({
			on_down(client_x, client_y) {
				drag_start_x = client_x;
				drag_start_y = client_y;
				capture_width_state(side);
			},
			on_move: handle_move,
			on_up: handle_up,
		});
	}

	const drag_left = width_drag('width-left');
	const drag_right = width_drag('width-right');

	const drag_bottom = touch_drag({
		on_down(client_x, client_y) {
			drag_start_x = client_x;
			drag_start_y = client_y;
			capture_height_state();
		},
		on_move: handle_move,
		on_up: handle_up,
	});

	function handle_width_dblclick(e) {
		e.preventDefault();
		e.stopPropagation();
		const tr = svedit.session.tr;
		tr.set([...path, max_width_field], 0);
		svedit.session.apply(tr);
	}

	function handle_height_dblclick(e) {
		e.preventDefault();
		e.stopPropagation();
		const tr = svedit.session.tr;
		tr.set([...path, aspect_ratio_field], 0);
		svedit.session.apply(tr);
	}
</script>

<div
	class="viewbox-handles"
	style="position-anchor: {anchor_name};"
>
	<!-- Left width handle -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="handle handle-left"
		ondblclick={handle_width_dblclick}
		{@attach drag_left}
	>
		<div class="handle-line"></div>
	</div>

	<!-- Right width handle -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="handle handle-right"
		ondblclick={handle_width_dblclick}
		{@attach drag_right}
	>
		<div class="handle-line"></div>
	</div>

	<!-- Bottom aspect ratio handle -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="handle handle-bottom"
		ondblclick={handle_height_dblclick}
		{@attach drag_bottom}
	>
		<div class="handle-line"></div>
	</div>
</div>

<style>
	.viewbox-handles {
		position: absolute;
		top: anchor(top);
		left: anchor(left);
		bottom: anchor(bottom);
		right: anchor(right);
		pointer-events: none;
	}

	/* --- Drag handles --- */

	.handle {
		position: absolute;
		z-index: 20;
		pointer-events: auto;
		opacity: 1;
	}

	/* Toggled by the touch_drag attachment via classList */
	.handle:global(.dragging) {
		user-select: none;
	}

	/* Left handle — sits to the left of the viewbox */
	.handle-left {
		top: 0;
		bottom: 0;
		left: -14px;
		width: 14px;
		cursor: ew-resize;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Right handle — sits to the right of the viewbox */
	.handle-right {
		top: 0;
		bottom: 0;
		right: -14px;
		width: 14px;
		cursor: ew-resize;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Bottom handle — sits below the viewbox */
	.handle-bottom {
		left: 0;
		right: 0;
		bottom: -14px;
		height: 14px;
		cursor: ns-resize;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Visual indicator lines */
	.handle-left .handle-line,
	.handle-right .handle-line {
		width: 3px;
		height: 32px;
		max-height: 50%;
		border-radius: 2px;
		background: var(--svedit-editing-stroke, oklch(60% 0.22 283));
		opacity: 0.8;
	}

	.handle-bottom .handle-line {
		height: 3px;
		width: 32px;
		max-width: 50%;
		border-radius: 2px;
		background: var(--svedit-editing-stroke, oklch(60% 0.22 283));
		opacity: 0.8;
	}
</style>