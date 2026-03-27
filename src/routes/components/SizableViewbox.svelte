<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	const MIN_WIDTH = 40;
	const MIN_HEIGHT = 20;
	const SNAP_THRESHOLD = 0.05; // snap to natural ratio when within 5%

	/**
	 * @type {{
	 *   path: any[],
	 *   media_property?: string,
	 *   children: import('svelte').Snippet,
	 *   fallback_aspect_ratio?: number
	 * }}
	 */
	let {
		path,
		media_property = 'media',
		children,
		fallback_aspect_ratio = 16 / 9
	} = $props();

	// Derive field names from media_property: e.g. 'media' -> 'media_max_width', 'media_aspect_ratio'
	let max_width_field = $derived(`${media_property}_max_width`);
	let aspect_ratio_field = $derived(`${media_property}_aspect_ratio`);

	let node = $derived(svedit.session.get(path));
	let media_node = $derived(svedit.session.get([...path, media_property]));

	// The media's natural aspect ratio (or fallback)
	let natural_aspect_ratio = $derived(
		media_node?.width && media_node?.height
			? media_node.width / media_node.height
			: fallback_aspect_ratio
	);

	// Resolve aspect ratio: 0 means use natural ratio
	let resolved_aspect_ratio = $derived(
		node[aspect_ratio_field] > 0
			? node[aspect_ratio_field]
			: natural_aspect_ratio
	);

	// Resolve max-width style: 0 means full width (no constraint)
	let max_width_style = $derived(
		node[max_width_field] > 0
			? `${node[max_width_field]}px`
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
		drag_type = side;
		drag_start_x = e.clientX;

		const rect = viewbox_ref?.getBoundingClientRect();
		drag_start_max_width = node[max_width_field] > 0
			? node[max_width_field]
			: (rect?.width ?? 400);
		// Measure the parent's parent (outer wrapper's parent) for snap-to-full-width
		const container = viewbox_ref?.parentElement?.parentElement;
		const parent_rect = container?.getBoundingClientRect();
		drag_container_width = parent_rect?.width ?? drag_start_max_width;
	}

	function handle_height_pointer_down(e) {
		if (!svedit.editable) return;
		e.preventDefault();
		e.stopPropagation();
		drag_type = 'height';
		drag_start_y = e.clientY;
		drag_start_aspect_ratio = resolved_aspect_ratio;

		const rect = viewbox_ref?.getBoundingClientRect();
		drag_start_max_width = rect?.width ?? 400;
	}

	function handle_pointer_move(e) {
		if (!drag_type || !viewbox_ref) return;

		if (drag_type === 'width-left' || drag_type === 'width-right') {
			const dx = e.clientX - drag_start_x;
			const direction = drag_type === 'width-right' ? 1 : -1;
			const new_width = Math.max(MIN_WIDTH, Math.round(drag_start_max_width + dx * direction * 2));

			const tr = svedit.session.tr;
			tr.set([...path, max_width_field], new_width >= drag_container_width ? 0 : new_width);
			svedit.session.apply(tr, { batch: true });
		} else if (drag_type === 'height') {
			const dy = e.clientY - drag_start_y;
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

	function handle_pointer_up() {
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
</script>

<svelte:window onpointermove={handle_pointer_move} onpointerup={handle_pointer_up} />

<!-- Outer wrapper: not clipped, provides positioning context for handles -->
<div
	class="sizable-viewbox-wrapper"
	class:dragging={drag_type !== null}
	class:is-editing={svedit.editable}
	style:max-width={max_width_style}
>
	<!-- Inner viewbox: clips content, holds aspect ratio -->
	<div
		bind:this={viewbox_ref}
		class="sizable-viewbox"
		style:aspect-ratio={resolved_aspect_ratio}
	>
		{@render children()}
	</div>

	{#if svedit.editable}
		<!-- Left width handle — outside left edge -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="handle handle-left"
			onpointerdown={(e) => handle_width_pointer_down(e, 'width-left')}
		>
			<div class="handle-line"></div>
		</div>

		<!-- Right width handle — outside right edge -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="handle handle-right"
			onpointerdown={(e) => handle_width_pointer_down(e, 'width-right')}
		>
			<div class="handle-line"></div>
		</div>

		<!-- Bottom aspect ratio handle — outside bottom edge -->
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
	/* Outer wrapper: positioning context, NOT clipped */
	.sizable-viewbox-wrapper {
		position: relative;
		width: 100%;
	}

	.sizable-viewbox-wrapper.dragging {
		user-select: none;
	}

	/* Inner viewbox: clips content */
	.sizable-viewbox {
		width: 100%;
		overflow: hidden;
		border-radius: var(--border-radius, 0);
	}

	/* --- Drag handles --- */
	/* Positioned outside the viewbox bounds so they don't conflict
	   with MediaControls / focal point and remain usable on small viewboxes */

	.handle {
		position: absolute;
		z-index: 20;
		pointer-events: auto;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.sizable-viewbox-wrapper.is-editing:hover .handle,
	.sizable-viewbox-wrapper.dragging .handle {
		opacity: 1;
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