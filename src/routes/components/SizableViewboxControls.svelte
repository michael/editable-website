<script>
	import { getContext } from 'svelte';
	import { touch_drag } from '$lib/client/touch_drag.js';
	import { SNAP_ASPECT_RATIOS } from '$lib/config.js';

	const svedit = getContext('svedit');

	const MIN_WIDTH = 40;
	const MIN_HEIGHT = 20;

	// Snap engages when the raw pixel value is within this many px of a snap target
	const SNAP_PX = 12;

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

	// --- Snap label shown during drag ---
	let snap_label = $state(/** @type {string | null} */ (null));

	// --- Snap candidates (all common ratios + natural) ---
	function get_snap_candidates() {
		return [
			...SNAP_ASPECT_RATIOS,
			{ ratio: natural_aspect_ratio, label: 'original' },
		];
	}

	/**
	 * For width drags: given a fixed height, find the snap width closest to raw_width.
	 * Returns { width, ratio, label } or null if nothing is close enough.
	 *
	 * @param {number} raw_width
	 * @param {number} fixed_height
	 * @returns {{ width: number, ratio: number, label: string } | null}
	 */
	function snap_width_for_height(raw_width, fixed_height) {
		const candidates = get_snap_candidates();
		let best = null;
		let best_distance = Infinity;

		for (const c of candidates) {
			const snap_w = c.ratio * fixed_height;
			const distance = Math.abs(raw_width - snap_w);
			if (distance < SNAP_PX && distance < best_distance) {
				best = { width: Math.round(snap_w), ratio: c.ratio, label: c.label };
				best_distance = distance;
			}
		}

		return best;
	}

	/**
	 * For height drags: given a fixed width, find the snap height closest to raw_height.
	 * Returns { height, ratio, label } or null if nothing is close enough.
	 *
	 * @param {number} raw_height
	 * @param {number} fixed_width
	 * @returns {{ height: number, ratio: number, label: string } | null}
	 */
	function snap_height_for_width(raw_height, fixed_width) {
		const candidates = get_snap_candidates();
		let best = null;
		let best_distance = Infinity;

		for (const c of candidates) {
			const snap_h = fixed_width / c.ratio;
			const distance = Math.abs(raw_height - snap_h);
			if (distance < SNAP_PX && distance < best_distance) {
				best = { height: Math.round(snap_h), ratio: c.ratio, label: c.label };
				best_distance = distance;
			}
		}

		return best;
	}

	/**
	 * Convert a snap ratio result into the stored aspect_ratio value.
	 * 'original' maps to 0 (convention); otherwise store the exact ratio.
	 *
	 * @param {{ ratio: number, label: string }} snapped
	 * @returns {number}
	 */
	function stored_ratio(snapped) {
		return snapped.label === 'original' ? 0 : snapped.ratio;
	}

	// --- Drag state (shared across all handles) ---
	let drag_type = null;
	let drag_start_x = 0;
	let drag_start_y = 0;
	let drag_start_max_width = 0;
	let drag_start_aspect_ratio = 0;
	let drag_start_visual_height = 0;
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
		drag_start_aspect_ratio = resolved_aspect_ratio;
		// Capture the current visual height so we can preserve it
		drag_start_visual_height = rect?.height ?? (drag_start_max_width / resolved_aspect_ratio);
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

		snap_label = null;
	}

	function capture_height_state() {
		drag_type = 'height';
		drag_start_aspect_ratio = resolved_aspect_ratio;

		const viewbox_el = get_viewbox_el();
		const rect = viewbox_el?.getBoundingClientRect();
		drag_start_max_width = rect?.width ?? 400;

		snap_label = null;
	}

	function handle_move(client_x, client_y) {
		if (!drag_type) return;

		if (drag_type === 'width-left' || drag_type === 'width-right') {
			const dx = client_x - drag_start_x;
			const direction = drag_type === 'width-right' ? 1 : -1;
			// Clamp to container width — once you hit the edge, everything stops
			const raw_width = Math.min(drag_container_width, Math.max(MIN_WIDTH, Math.round(drag_start_max_width + dx * direction * drag_width_multiplier)));

			// Try to snap the width to a value that produces a common aspect ratio
			// at the fixed visual height
			const snapped = snap_width_for_height(raw_width, drag_start_visual_height);

			let final_width;
			let final_ratio;

			if (snapped) {
				final_width = Math.round(snapped.width / 4) * 4;
				final_ratio = stored_ratio(snapped);
				snap_label = snapped.label;
			} else {
				final_width = Math.round(raw_width / 4) * 4;
				// No snap — compute the freeform ratio from the exact width and fixed height
				final_ratio = Math.round((final_width / drag_start_visual_height) * 1000) / 1000;
				snap_label = null;
			}

			const is_full_width = final_width >= drag_container_width;

			const tr = svedit.session.tr;
			tr.set([...path, max_width_field], is_full_width ? 0 : final_width);
			tr.set([...path, aspect_ratio_field], final_ratio);
			svedit.session.apply(tr, { batch: true });
		} else if (drag_type === 'height') {
			const dy = client_y - drag_start_y;
			const current_width = drag_start_max_width;
			const old_height = current_width / drag_start_aspect_ratio;
			const raw_height = Math.max(MIN_HEIGHT, old_height + dy);

			// Try to snap the height to a value that produces a common aspect ratio
			// at the fixed visual width
			const snapped = snap_height_for_width(raw_height, current_width);

			let final_ratio;

			if (snapped) {
				final_ratio = stored_ratio(snapped);
				snap_label = snapped.label;
			} else {
				final_ratio = Math.round((current_width / raw_height) * 1000) / 1000;
				snap_label = null;
			}

			const tr = svedit.session.tr;
			tr.set([...path, aspect_ratio_field], final_ratio);
			svedit.session.apply(tr, { batch: true });
		}
	}

	function handle_up() {
		if (!drag_type) return;

		// Final non-batched apply for clean undo point
		if (drag_type === 'width-left' || drag_type === 'width-right') {
			const tr = svedit.session.tr;
			tr.set([...path, max_width_field], node[max_width_field]);
			tr.set([...path, aspect_ratio_field], node[aspect_ratio_field]);
			svedit.session.apply(tr);
		} else if (drag_type === 'height') {
			const tr = svedit.session.tr;
			tr.set([...path, aspect_ratio_field], node[aspect_ratio_field]);
			svedit.session.apply(tr);
		}

		drag_type = null;
		snap_label = null;
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
		tr.set([...path, aspect_ratio_field], 0);
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

	<!-- Snap label tooltip -->
	{#if snap_label}
		<div class="snap-label">{snap_label}</div>
	{/if}
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

	/* Snap label */
	.snap-label {
		position: absolute;
		bottom: -32px;
		left: 50%;
		transform: translateX(-50%);
		background: var(--svedit-editing-stroke, oklch(60% 0.22 283));
		color: white;
		font-size: 11px;
		font-weight: 600;
		line-height: 1;
		padding: 3px 6px;
		white-space: nowrap;
		pointer-events: none;
		z-index: 30;
	}
</style>