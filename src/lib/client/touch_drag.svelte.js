/**
 * Reusable touch-aware drag utility.
 *
 * - Mouse / pen: drag starts immediately on pointerdown.
 * - Touch: user must hold still for HOLD_DELAY_MS before dragging
 *   (disambiguates from page scroll).
 *
 * Usage:
 *
 *   const drag = create_touch_drag({
 *     on_down(client_x, client_y) { ... capture initial state ... },
 *     on_move(client_x, client_y) { ... apply delta ... },
 *     on_up() { ... finalise ... },
 *   });
 *
 *   // In template — wire up the drag surface(s):
 *   <div onpointerdown={drag.pointer_down}> ... </div>
 *
 *   // Global listeners (once, in the component):
 *   <svelte:window onpointermove={drag.pointer_move} onpointerup={drag.pointer_up} />
 *
 *   // Attach touch listeners to each drag surface element via $effect:
 *   $effect(() => drag.attach(element));
 *
 *   // Reactive state for styling:
 *   drag.dragging        — true while actively dragging (mouse or touch)
 *   drag.touch_locked    — true once the touch hold threshold passes
 */

const HOLD_DELAY_MS = 300;
const TOUCH_MOVE_TOLERANCE = 8; // px — cancel hold if finger moves before timer

/**
 * @param {{
 *   should_start?: () => boolean,
 *   on_down?: (client_x: number, client_y: number) => void,
 *   on_move: (client_x: number, client_y: number) => void,
 *   on_up?: () => void,
 * }} callbacks
 */
export function create_touch_drag(callbacks) {
	let dragging = $state(false);
	let touch_locked = $state(false);

	// Internal state (not exposed)
	let hold_timer = null;
	let touch_start_x = 0;
	let touch_start_y = 0;

	// --- Mouse / pen (immediate drag) ---

	function pointer_down(e) {
		// Touch is handled separately via touch events
		if (e.pointerType === 'touch') return;
		if (callbacks.should_start && !callbacks.should_start()) return;

		e.preventDefault();
		e.stopPropagation();

		dragging = true;
		callbacks.on_down?.(e.clientX, e.clientY);
	}

	function pointer_move(e) {
		if (e.pointerType === 'touch') return;
		if (!dragging) return;

		callbacks.on_move(e.clientX, e.clientY);
	}

	function pointer_up(e) {
		if (e?.pointerType === 'touch') return;
		if (!dragging) return;

		dragging = false;
		callbacks.on_up?.();
	}

	// --- Touch (hold-then-drag) ---

	function handle_touch_start(e) {
		if (e.touches.length !== 1) return;
		if (callbacks.should_start && !callbacks.should_start()) return;

		const t = e.touches[0];
		touch_start_x = t.clientX;
		touch_start_y = t.clientY;

		// Don't preventDefault — allow browser scroll if user moves before hold
		clear_hold_timer();
		hold_timer = setTimeout(() => {
			hold_timer = null;
			touch_locked = true;
			dragging = true;
			callbacks.on_down?.(touch_start_x, touch_start_y);
		}, HOLD_DELAY_MS);
	}

	function handle_touch_move(e) {
		if (e.touches.length !== 1) {
			cancel_touch();
			return;
		}

		const t = e.touches[0];

		// If not locked yet, check if finger moved too far → cancel hold
		if (!touch_locked) {
			if (hold_timer) {
				const dx = Math.abs(t.clientX - touch_start_x);
				const dy = Math.abs(t.clientY - touch_start_y);
				if (dx > TOUCH_MOVE_TOLERANCE || dy > TOUCH_MOVE_TOLERANCE) {
					clear_hold_timer();
				}
			}
			// Let browser handle the scroll
			return;
		}

		// Touch locked — prevent scrolling and drag instead
		e.preventDefault();
		callbacks.on_move(t.clientX, t.clientY);
	}

	function handle_touch_end() {
		const was_dragging = dragging;
		cancel_touch();
		if (was_dragging) {
			callbacks.on_up?.();
		}
	}

	function cancel_touch() {
		clear_hold_timer();
		touch_locked = false;
		dragging = false;
	}

	function clear_hold_timer() {
		if (hold_timer) {
			clearTimeout(hold_timer);
			hold_timer = null;
		}
	}

	// --- Attach touch listeners to an element ---
	// Returns a cleanup function. Designed to be called inside $effect:
	//   $effect(() => drag.attach(el));
	// The touchmove listener must be { passive: false } so preventDefault works.

	function attach(el) {
		if (!el) return;

		el.addEventListener('touchstart', handle_touch_start, { passive: true });
		el.addEventListener('touchmove', handle_touch_move, { passive: false });
		el.addEventListener('touchend', handle_touch_end);
		el.addEventListener('touchcancel', handle_touch_end);

		return () => {
			el.removeEventListener('touchstart', handle_touch_start);
			el.removeEventListener('touchmove', handle_touch_move);
			el.removeEventListener('touchend', handle_touch_end);
			el.removeEventListener('touchcancel', handle_touch_end);
		};
	}

	return {
		// Reactive state (read-only for consumers)
		get dragging() { return dragging; },
		get touch_locked() { return touch_locked; },

		// Pointer handlers (for mouse/pen — wire to element + svelte:window)
		pointer_down,
		pointer_move,
		pointer_up,

		// Attach touch listeners to an element (call inside $effect)
		attach,

		// Programmatic cancel (e.g. on component teardown)
		cancel: cancel_touch,
	};
}