<script>
	/**
	 * Reusable bottom drawer / bottom sheet backed by a dialog element so it
	 * participates in the browser top layer when open.
	 *
	 * Usage:
	 * - Provide content via the `children` snippet
	 * - Bind `open` from the parent
	 * - Optional `label` customizes the panel label
	 */

	let {
		open = $bindable(),
		label = 'Pages',
		children
	} = $props();

	const close_drawer_height_ratio = 0.12;
	const min_drawer_height_ratio = 0;
	const max_drawer_height_ratio = 0.9;
	const default_drawer_height_ratio = 2 / 3;
	const snap_drawer_height_ratios = [1 / 3, 2 / 3, 3 / 4];

	let dialog_ref = $state();
	let is_visible = $state(open);
	let is_animating_open = $state(false);
	let drawer_height_ratio = $state(default_drawer_height_ratio);
	let is_resizing = $state(false);
	let is_snapping = $state(false);
	let is_closing_from_drag = $state(false);
	let resize_start_y = $state(0);
	let resize_start_height_ratio = $state(default_drawer_height_ratio);
	let last_open_drawer_height_ratio = $state(default_drawer_height_ratio);

	function clamp_drawer_height_ratio(value) {
		return Math.min(Math.max(value, min_drawer_height_ratio), max_drawer_height_ratio);
	}

	function get_nearest_snap_drawer_height_ratio(value) {
		let nearest_ratio = snap_drawer_height_ratios[0];
		let nearest_distance = Math.abs(value - nearest_ratio);

		for (const snap_ratio of snap_drawer_height_ratios) {
			const distance = Math.abs(value - snap_ratio);
			if (distance < nearest_distance) {
				nearest_ratio = snap_ratio;
				nearest_distance = distance;
			}
		}

		return nearest_ratio;
	}

	function close() {
		if (!is_closing_from_drag) {
			drawer_height_ratio = last_open_drawer_height_ratio;
		}
		is_snapping = false;
		is_closing_from_drag = false;
		open = false;
	}

	function handle_dialog_cancel(event) {
		event.preventDefault();
		close();
	}

	function handle_backdrop_click(event) {
		if (event.target === dialog_ref) {
			close();
		}
	}

	function start_resize(client_y) {
		is_resizing = true;
		is_snapping = false;
		is_closing_from_drag = false;
		resize_start_y = client_y;
		resize_start_height_ratio = drawer_height_ratio;
	}

	function update_resize(client_y) {
		if (!is_resizing) return;

		const viewport_height = window.innerHeight || 1;
		const delta_y = resize_start_y - client_y;
		const next_height_ratio = resize_start_height_ratio + delta_y / viewport_height;
		drawer_height_ratio = clamp_drawer_height_ratio(next_height_ratio);
	}

	function finish_resize(client_y) {
		if (!is_resizing) return;

		const viewport_height = window.innerHeight || 1;
		const delta_y = resize_start_y - client_y;
		const raw_released_height_ratio = resize_start_height_ratio + delta_y / viewport_height;
		const released_height_ratio = clamp_drawer_height_ratio(raw_released_height_ratio);

		is_resizing = false;

		if (raw_released_height_ratio <= close_drawer_height_ratio) {
			is_snapping = true;
			is_closing_from_drag = true;
			drawer_height_ratio = 0;
			return;
		}

		is_snapping = true;
		is_closing_from_drag = false;
		const snapped_height_ratio = get_nearest_snap_drawer_height_ratio(released_height_ratio);
		drawer_height_ratio = snapped_height_ratio;
		last_open_drawer_height_ratio = snapped_height_ratio;
	}

	function handle_handle_pointerdown(event) {
		event.preventDefault();
		start_resize(event.clientY);
	}

	function handle_window_pointermove(event) {
		update_resize(event.clientY);
	}

	function handle_window_pointerup(event) {
		finish_resize(event.clientY);
	}

	$effect(() => {
		if (!dialog_ref) return;

		if (open) {
			document.documentElement.classList.add('drawer-open');
			document.body.classList.add('drawer-open');
			is_visible = true;
			is_snapping = false;
			is_closing_from_drag = false;
			drawer_height_ratio = last_open_drawer_height_ratio;

			if (!dialog_ref.open) {
				dialog_ref.showModal();
			}

			requestAnimationFrame(() => {
				is_animating_open = true;
			});
		} else {
			document.documentElement.classList.remove('drawer-open');
			document.body.classList.remove('drawer-open');

			if (dialog_ref.open) {
				is_animating_open = false;
			}
		}

		return () => {
			document.documentElement.classList.remove('drawer-open');
			document.body.classList.remove('drawer-open');
		};
	});

	function handle_transition_end(event) {
		if (event.target !== event.currentTarget) return;

		if (event.propertyName === 'transform') {
			if (!open && dialog_ref?.open) {
				dialog_ref.close();
				is_visible = false;
			}
			return;
		}

		if (event.propertyName !== 'height') return;

		if (is_closing_from_drag) {
			is_snapping = false;
			is_closing_from_drag = false;
			open = false;
			return;
		}

		if (is_snapping) {
			is_snapping = false;
		}
	}
</script>

<svelte:window onpointermove={handle_window_pointermove} onpointerup={handle_window_pointerup} />

<dialog
	bind:this={dialog_ref}
	class="drawer-dialog"
	class:animating-open={is_animating_open}
	class:resizing={is_resizing}
	class:snapping={is_snapping}
	oncancel={handle_dialog_cancel}
	onclick={handle_backdrop_click}
>
	<div class="drawer-shell" role="complementary" aria-label={label}>
		<div class="drawer" ontransitionend={handle_transition_end}>
			<button
				type="button"
				class="drawer-handle-button"
				aria-label={`Resize ${label} drawer`}
				onpointerdown={handle_handle_pointerdown}
			>
				<span class="drawer-handle" aria-hidden="true"></span>
			</button>

			<div
				id="drawer-panel"
				class="drawer-panel"
				style={`height: ${drawer_height_ratio * 100}vh; max-height: ${drawer_height_ratio * 100}vh;`}
				ontransitionend={handle_transition_end}
			>
				<div class="drawer-content">
					{@render children?.({ close })}
				</div>
			</div>
		</div>
	</div>
</dialog>

<style>
	.drawer-dialog {
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		max-width: none;
		max-height: none;
		width: 100vw;
		height: 100vh;
		overflow: visible;
	}

	:global(html.drawer-open),
	:global(body.drawer-open) {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	:global(html.drawer-open::-webkit-scrollbar),
	:global(body.drawer-open::-webkit-scrollbar) {
		display: none;
		width: 0;
		height: 0;
	}

	.drawer-dialog::backdrop {
		background: transparent;
	}

	.drawer-dialog[open]::backdrop {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
	}

	.drawer-shell {
		position: fixed;
		inset: 0;
		pointer-events: none;
	}

	.drawer {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		pointer-events: none;
		transform: translateY(calc(100% - 1.5rem));
		transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
		will-change: transform;
	}

	.drawer-dialog.animating-open .drawer {
		transform: translateY(0);
	}

	.drawer-dialog.resizing .drawer {
		transition: none;
	}

	.drawer-panel {
		transition: height 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.drawer-dialog.resizing .drawer-panel {
		transition: none;
	}

	.drawer-panel {
		width: 100%;
		background: var(--background);
		box-shadow: 0 -12px 40px oklch(0% 0 0 / 0.12);
		border-top: 0.5px solid color-mix(in oklch, var(--foreground) 18%, transparent);
		color: var(--foreground);
		padding-bottom: max(1rem, env(safe-area-inset-bottom));
		overflow: auto;
		overscroll-behavior: contain;
		pointer-events: auto;
	}

	.drawer-handle-button {
		position: absolute;
		left: 50%;
		top: -1.5rem;
		z-index: 1;
		display: flex;
		justify-content: center;
		width: 4rem;
		padding: 0.55rem 0 0.35rem;
		border: 0;
		background: transparent;
		cursor: ns-resize;
		touch-action: none;
		transform: translateX(-50%);
		pointer-events: auto;
	}

	.drawer-handle {
		display: block;
		width: 2.5rem;
		height: 0.32rem;
		background: color-mix(in oklch, var(--background) 92%, var(--foreground) 22%);
		box-shadow: 0 1px 8px oklch(0% 0 0 / 0.18);
	}

	.drawer-content {
		width: 100%;
		max-width: 80rem;
		margin: 0 auto;
		padding: 1rem 1.25rem 1.25rem;
		min-height: 12rem;
	}

	@media (min-width: 640px) {
		.drawer-content {
			padding-left: 1.75rem;
			padding-right: 1.75rem;
		}
	}

	@media (min-width: 768px) {
		.drawer-content {
			padding-left: 2.5rem;
			padding-right: 2.5rem;
		}
	}

	@media (min-width: 1024px) {
		.drawer-content {
			padding-left: 3.5rem;
			padding-right: 3.5rem;
		}
	}

	@media (max-width: 640px) {
		.drawer {
			transform: translateY(100%);
		}
	}
</style>
