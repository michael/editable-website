<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	const MIN_WIDTH = 40;
	const MIN_HEIGHT = 20;



	/**
	 * @type {{
	 *   path: any[],
	 *   children: import('svelte').Snippet,
	 *   fallback_aspect_ratio?: number
	 * }}
	 */
	let {
		path,
		children,
		fallback_aspect_ratio = 16 / 9
	} = $props();

	let node = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, 'media']));

	$inspect(node.viewbox_max_width);

	// Resolve aspect ratio: 0 means use media's natural ratio or fallback
	let resolved_aspect_ratio = $derived(
		node.viewbox_aspect_ratio > 0
			? node.viewbox_aspect_ratio
			: (media_node?.width && media_node?.height
				? media_node.width / media_node.height
				: fallback_aspect_ratio)
	);

	// Resolve max-width style: 0 means full width (no constraint)
	let max_width_style = $derived(
		node.viewbox_max_width > 0
			? `${node.viewbox_max_width}px`
			: '100%'
	);

	// --- Drag state ---
	let drag_type = $state(null); // 'width-left' | 'width-right' | 'height'
	let drag_start_x = $state(0);
	let drag_start_y = $state(0);
	let drag_start_max_width = $state(0);
	let drag_start_aspect_ratio = $state(0);
	let drag_container_width = $state(0);
	let viewbox_ref = $state(null);

	function handle_width_pointer_down(e, side) {
		if (!svedit.editable) return;
		e.preventDefault();
		e.stopPropagation();
		drag_type = side; // 'width-left' or 'width-right'
		drag_start_x = e.clientX;

		// If max_width is 0 (full width), start from the current rendered width
		const rect = viewbox_ref?.getBoundingClientRect();
		drag_start_max_width = node.viewbox_max_width > 0
			? node.viewbox_max_width
			: (rect?.width ?? 400);
		// Measure the parent container so we can snap to full-width when dragging beyond it
		const parent_rect = viewbox_ref?.parentElement?.getBoundingClientRect();
		drag_container_width = parent_rect?.width ?? drag_start_max_width;
	}

	function handle_height_pointer_down(e) {
		if (!svedit.editable) return;
		e.preventDefault();
		e.stopPropagation();
		drag_type = 'height';
		drag_start_y = e.clientY;
		drag_start_aspect_ratio = resolved_aspect_ratio;

		// Need current rendered width to compute aspect ratio from height
		const rect = viewbox_ref?.getBoundingClientRect();
		drag_start_max_width = rect?.width ?? 400;
	}

	function handle_pointer_move(e) {
		if (!drag_type || !viewbox_ref) return;

		if (drag_type === 'width-left' || drag_type === 'width-right') {
			const dx = e.clientX - drag_start_x;
			// Left handle: dragging left increases width, dragging right decreases
			// Right handle: dragging right increases width, dragging left decreases
			// Both sides move symmetrically, so multiply by 2
			const direction = drag_type === 'width-right' ? 1 : -1;
			const new_width = Math.max(MIN_WIDTH, Math.round(drag_start_max_width + dx * direction * 2));

			// Snap to full-width (0) when dragging at or beyond the container width
			const tr = svedit.session.tr;
			tr.set([...path, 'viewbox_max_width'], new_width >= drag_container_width ? 0 : new_width);
			svedit.session.apply(tr, { batch: true });
		} else if (drag_type === 'height') {
			const dy = e.clientY - drag_start_y;
			const current_width = drag_start_max_width;
			const old_height = current_width / drag_start_aspect_ratio;
			const new_height = Math.max(MIN_HEIGHT, old_height + dy);
			const new_ratio = current_width / new_height;

			const tr = svedit.session.tr;
			tr.set([...path, 'viewbox_aspect_ratio'], Math.round(new_ratio * 1000) / 1000);
			svedit.session.apply(tr, { batch: true });
		}
	}

	function handle_pointer_up() {
		if (!drag_type) return;

		// Final non-batched apply for clean undo point
		if (drag_type === 'width-left' || drag_type === 'width-right') {
			const tr = svedit.session.tr;
			tr.set([...path, 'viewbox_max_width'], node.viewbox_max_width);
			svedit.session.apply(tr);
		} else if (drag_type === 'height') {
			const tr = svedit.session.tr;
			tr.set([...path, 'viewbox_aspect_ratio'], node.viewbox_aspect_ratio);
			svedit.session.apply(tr);
		}

		drag_type = null;
	}
</script>

<svelte:window onpointermove={handle_pointer_move} onpointerup={handle_pointer_up} />

<div
	bind:this={viewbox_ref}
	class="sizable-viewbox"
	class:dragging={drag_type !== null}
	style:max-width={max_width_style}
	style:aspect-ratio={resolved_aspect_ratio}
>
	{@render children()}

	{#if svedit.editable}
		<!-- Left width handle -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="handle handle-left"
			onpointerdown={(e) => handle_width_pointer_down(e, 'width-left')}
		>
			<div class="handle-line"></div>
		</div>

		<!-- Right width handle -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="handle handle-right"
			onpointerdown={(e) => handle_width_pointer_down(e, 'width-right')}
		>
			<div class="handle-line"></div>
		</div>

		<!-- Bottom aspect ratio handle -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="handle handle-bottom"
			onpointerdown={handle_height_pointer_down}
		>
			<div class="handle-line"></div>
		</div>
	{/if}
</div>

<style>
	.sizable-viewbox {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: var(--image-border-radius, 0);
	}

	.sizable-viewbox.dragging {
		user-select: none;
	}

	/* --- Drag handles --- */

	.handle {
		position: absolute;
		z-index: 20;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.sizable-viewbox:hover .handle,
	.sizable-viewbox.dragging .handle {
		opacity: 1;
	}

	/* Left handle */
	.handle-left {
		top: 0;
		left: 0;
		bottom: 0;
		width: 12px;
		cursor: ew-resize;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Right handle */
	.handle-right {
		top: 0;
		right: 0;
		bottom: 0;
		width: 12px;
		cursor: ew-resize;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Bottom handle */
	.handle-bottom {
		left: 0;
		right: 0;
		bottom: 0;
		height: 12px;
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
