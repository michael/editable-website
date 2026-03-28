<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	// Zoom constraints
	const MIN_SCALE = 1.0;
	const MAX_SCALE = 5.0;

	let { path } = $props();

	let media_node = $derived(svedit.session.get(path));
	let controls_ref = $state(null);

	// Drag state
	let is_dragging = $state(false);
	let last_x = $state();
	let last_y = $state();

	// Panning control — disable only when the media exactly fills the container
	// with no room to move: cover at scale 1.0 with matching aspect ratios.
	// All other cases (contain, scale > 1, mismatched ratios) allow panning.
	// Uses $effect + rAF so CSS anchor positioning has resolved before we measure.
	let can_pan = $state(false);

	$effect(() => {
		// Track reactive dependencies
		const _scale = media_node.scale;
		const _width = media_node.width;
		const _height = media_node.height;
		const _ref = controls_ref;

		// Use rAF to ensure CSS anchor positioning has resolved before measuring
		requestAnimationFrame(() => {
			if (!_ref || !_width || !_height) {
				can_pan = false;
				return;
			}

			if (_scale > 1.0) {
				can_pan = true;
				return;
			}

			// At scale 1.0, panning is only useful if aspect ratios differ:
			// - cover: image overflows on one axis, focal point picks visible area
			// - contain: image has empty space, focal point positions it in the frame
			const rect = _ref.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) {
				can_pan = false;
				return;
			}
			const container_ratio = rect.width / rect.height;
			const media_ratio = _width / _height;
			can_pan = Math.abs(media_ratio - container_ratio) > 0.01;
		});
	});

	function handle_pointer_down(e) {
		if (!can_pan) {
			e.preventDefault();
			return;
		}
		is_dragging = true;
		last_x = e.clientX;
		last_y = e.clientY;
		e.preventDefault();
	}

	function handle_double_click(e) {
		const tr = svedit.session.tr;
		tr.set([...path, 'scale'], MIN_SCALE);
		// tr.set([...path, 'focal_point_x'], 0.5);
		// tr.set([...path, 'focal_point_y'], 0.5);
		tr.set([...path, 'object_fit'], media_node.object_fit === 'cover' ? 'contain' : 'cover');
		svedit.session.apply(tr, { batch: true });
	}

	function handle_pointer_move(e) {
		if (!is_dragging || !controls_ref) return;

		const rect = controls_ref.getBoundingClientRect();
		const dx = ((e.clientX - last_x) / rect.width) * -1;
		const dy = ((e.clientY - last_y) / rect.height) * -1;

		const new_focal_point_x = Math.min(Math.max(media_node.focal_point_x - dx, 0), 1);
		const new_focal_point_y = Math.min(Math.max(media_node.focal_point_y - dy, 0), 1);

		const tr = svedit.session.tr;
		tr.set([...path, 'focal_point_x'], new_focal_point_x);
		tr.set([...path, 'focal_point_y'], new_focal_point_y);
		svedit.session.apply(tr, { batch: true });

		last_x = e.clientX;
		last_y = e.clientY;
	}

	function handle_pointer_up() {
		if (!is_dragging) return;
		is_dragging = false;
	}

	function handle_wheel(e) {
		// Only zoom when meta (Cmd) or ctrl key is held, otherwise let the page scroll
		if (!e.metaKey && !e.ctrlKey) return;
		e.preventDefault();
		const zoomFactor = e.deltaY < 0 ? 1.01 : 0.99;

		const tr = svedit.session.tr;
		tr.set([...path, 'scale'], Math.min(Math.max(media_node.scale * zoomFactor, MIN_SCALE), MAX_SCALE));
		svedit.session.apply(tr, { batch: true });
	}
</script>

<svelte:window onpointermove={handle_pointer_move} onpointerup={handle_pointer_up} />

<div
	bind:this={controls_ref}
	class="media-controls"
	ondblclick={handle_double_click}
	onpointerdown={handle_pointer_down}
	onwheel={handle_wheel}
	role="button"
	class:dragging={is_dragging}
	class:no-pan={!can_pan}
	tabindex="0"
>
	{#if can_pan}
		<div
			class="marker"
			style={`left: ${media_node.focal_point_x * 100}%; top: ${media_node.focal_point_y * 100}%;`}
		></div>
	{/if}
</div>

<style>
	.media-controls {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;

		pointer-events: auto;
		cursor: grab;
		z-index: 10;
	}

	.media-controls.no-pan {
		cursor: default;
	}

	.media-controls.dragging {
		cursor: grabbing;
	}

	.marker {
		position: absolute;
		width: 5%;
		aspect-ratio: 1/1;
		transform: translate(-50%, -50%);
		pointer-events: none;
		mix-blend-mode: difference;
		border: 1px solid var(--svedit-editing-stroke);
		border-radius: 50%;
	}

	/* Center crosshair - horizontal line */
	.marker::before {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		width: 150%;
		height: 1px;
		background: var(--svedit-editing-stroke);
		transform: translate(-50%, -50%);
	}

	/* Center crosshair - vertical line */
	.marker::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		width: 1px;
		height: 150%;
		background: var(--svedit-editing-stroke);
		transform: translate(-50%, -50%);
	}
</style>
