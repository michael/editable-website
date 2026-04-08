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

	let dialog_ref = $state();
	let is_visible = $state(open);
	let is_animating_open = $state(false);

	function close() {
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

	$effect(() => {
		if (!dialog_ref) return;

		if (open) {
			is_visible = true;

			if (!dialog_ref.open) {
				dialog_ref.showModal();
			}

			requestAnimationFrame(() => {
				is_animating_open = true;
			});
		} else if (dialog_ref.open) {
			is_animating_open = false;
		}
	});

	function handle_transition_end() {
		if (!open && dialog_ref?.open) {
			dialog_ref.close();
			is_visible = false;
		}
	}
</script>

<dialog
	bind:this={dialog_ref}
	class="drawer-dialog"
	class:animating-open={is_animating_open}
	oncancel={handle_dialog_cancel}
	onclick={handle_backdrop_click}
>
	<div class="drawer-shell" role="complementary" aria-label={label}>
		<div class="drawer" ontransitionend={handle_transition_end}>
			<div id="drawer-panel" class="drawer-panel">
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
		pointer-events: none;
		transform: translateY(calc(100% - 1.5rem));
		transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
		will-change: transform;
	}

	.drawer-dialog.animating-open .drawer {
		transform: translateY(0);
	}

	.drawer-panel {
		width: 100%;
		height: 66.666vh;
		max-height: 66.666vh;
		background: var(--background);
		box-shadow: 0 -12px 40px oklch(0% 0 0 / 0.12);
		border-top: 0.5px solid color-mix(in oklch, var(--foreground) 18%, transparent);
		color: var(--foreground);
		padding-bottom: max(1rem, env(safe-area-inset-bottom));
		overflow: auto;
		overscroll-behavior: contain;
		pointer-events: auto;
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

		.drawer-panel {
			height: 66.666vh;
			max-height: 66.666vh;
		}
	}
</style>
