<script>
	import { getContext } from 'svelte';
	import { touch_drag, lock_cursor, unlock_cursor } from '$lib/client/touch_drag.js';

	const svedit = getContext('svedit');

	// Zoom constraints
	const MIN_SCALE = 1.0;
	const MAX_SCALE = 5.0;

	let { path } = $props();

	let media_node = $derived(svedit.session.get(path));
	let controls_ref = $state(null);

	// Panning control — disable only when the media exactly fills the container
	// with no room to move: cover at scale 1.0 with matching aspect ratios.
	// All other cases (contain, scale > 1, mismatched ratios) allow panning.
	let can_pan = $state(false);
	let container_width = $state(0);
	let container_height = $state(0);

	// Track last pointer position for delta computation
	let last_x = 0;
	let last_y = 0;

	// ResizeObserver tracks actual container dimensions (covers aspect ratio
	// changes, max-width changes, window resizes, etc.)
	$effect(() => {
		const el = controls_ref;
		if (!el) return;

		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				container_width = entry.contentRect.width;
				container_height = entry.contentRect.height;
			}
		});
		ro.observe(el);
		return () => ro.disconnect();
	});

	// Derive can_pan from media props + observed container dimensions
	$effect(() => {
		const _scale = media_node.scale;
		const _width = media_node.width;
		const _height = media_node.height;
		const cw = container_width;
		const ch = container_height;

		if (!controls_ref || !_width || !_height || cw === 0 || ch === 0) {
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
		const container_ratio = cw / ch;
		const media_ratio = _width / _height;
		can_pan = Math.abs(media_ratio - container_ratio) > 0.01;
	});

	function apply_pan_delta(client_x, client_y) {
		const rect = controls_ref.getBoundingClientRect();
		const dx = ((client_x - last_x) / rect.width) * -1;
		const dy = ((client_y - last_y) / rect.height) * -1;

		const new_focal_point_x = Math.min(Math.max(media_node.focal_point_x - dx, 0), 1);
		const new_focal_point_y = Math.min(Math.max(media_node.focal_point_y - dy, 0), 1);

		const tr = svedit.session.tr;
		tr.set([...path, 'focal_point_x'], new_focal_point_x);
		tr.set([...path, 'focal_point_y'], new_focal_point_y);
		svedit.session.apply(tr, { batch: true });

		last_x = client_x;
		last_y = client_y;
	}

	function handle_double_click(e) {
		const tr = svedit.session.tr;
		tr.set([...path, 'scale'], MIN_SCALE);
		// tr.set([...path, 'focal_point_x'], 0.5);
		// tr.set([...path, 'focal_point_y'], 0.5);
		tr.set([...path, 'object_fit'], media_node.object_fit === 'cover' ? 'contain' : 'cover');
		svedit.session.apply(tr, { batch: true });
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

	const pan_drag = touch_drag({
		should_start: () => can_pan,
		on_down(client_x, client_y) {
			last_x = client_x;
			last_y = client_y;
			lock_cursor('grabbing');
		},
		on_move: apply_pan_delta,
		on_up() {
			unlock_cursor();
		},
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={controls_ref}
	class="media-controls"
	class:no-pan={!can_pan}
	ondblclick={handle_double_click}
	onwheel={handle_wheel}
	{@attach pan_drag}
	role="button"
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

	.media-controls:global(.dragging) {
		cursor: grabbing;
	}

	.media-controls:global(.touch-locked) {
		outline: 2px solid var(--svedit-editing-stroke, oklch(60% 0.22 283));
		outline-offset: -2px;
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