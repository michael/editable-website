<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	// Zoom constraints
	const MIN_SCALE = 1.0;
	const MAX_SCALE = 5.0;

	let { path } = $props();

	let image = $derived(svedit.session.get(path));
	let controls_ref = $state(null);

	// Drag state
	let is_dragging = $state(false);
	let last_x = $state();
	let last_y = $state();

	function handle_pointer_down(e) {
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
		tr.set([...path, 'object_fit'], image.object_fit === 'cover' ? 'contain' : 'cover');
		svedit.session.apply(tr, { batch: true });
	}

	function handle_pointer_move(e) {
		if (!is_dragging || !controls_ref) return;

		const rect = controls_ref.getBoundingClientRect();
		const dx = ((e.clientX - last_x) / rect.width) * -1;
		const dy = ((e.clientY - last_y) / rect.height) * -1;

		const new_focal_point_x = Math.min(Math.max(image.focal_point_x - dx, 0), 1);
		const new_focal_point_y = Math.min(Math.max(image.focal_point_y - dy, 0), 1);

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
		const rect = controls_ref.getBoundingClientRect();

		// screen x, y of zoom center (e.g. mouse/touch point)
		const viewport_zoom_center_x = (e.clientX - rect.left) / rect.width;
		const viewport_zoom_center_y = (e.clientY - rect.top) / rect.height;

		e.preventDefault();
		const zoomFactor = e.deltaY < 0 ? 1.01 : 0.99;

		const tr = svedit.session.tr;
		tr.set([...path, 'scale'], Math.min(Math.max(image.scale * zoomFactor, MIN_SCALE), MAX_SCALE));
		svedit.session.apply(tr, { batch: true });
	}
</script>

<svelte:window onpointermove={handle_pointer_move} onpointerup={handle_pointer_up} />

<div
	bind:this={controls_ref}
	class="image-controls"
	ondblclick={handle_double_click}
	onpointerdown={handle_pointer_down}
	onwheel={handle_wheel}
	role="button"
	class:dragging={is_dragging}
	tabindex="0"
>
	<div
		class="marker"
		style={`left: ${image.focal_point_x * 100}%; top: ${image.focal_point_y * 100}%;`}
	></div>
</div>

<style>
	.image-controls {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;

		pointer-events: auto;
		cursor: grab;
		z-index: 10;
	}

	.image-controls.dragging {
		cursor: grabbing;
	}

	.marker {
		position: absolute;
		width: 5%;
		aspect-ratio: 1/1;
		transform: translate(-50%, -50%);
		pointer-events: none;
		mix-blend-mode: difference;
		border: 1px solid var(--editing-stroke-color);
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
		background: var(--editing-stroke-color);
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
		background: var(--editing-stroke-color);
		transform: translate(-50%, -50%);
	}
</style>
