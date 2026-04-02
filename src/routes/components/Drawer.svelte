<script>
	/**
	 * Reusable bottom drawer / bottom sheet backed by a dialog element so it
	 * participates in the browser top layer when open, while the handle remains
	 * visible and clickable even when the drawer is closed.
	 *
	 * Usage:
	 * - Provide content via the `children` snippet
	 * - Bind `open` from the parent
	 * - Optional `label` customizes the handle title
	 */

	let {
		open = $bindable(),
		label = 'Pages',
		children
	} = $props();

	let dialog_ref = $state();
	let is_visible = $state(open);
	let is_animating_open = $state(false);

	function toggle() {
		if (open) {
			close();
		} else {
			open = true;
		}
	}

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

{#if !is_visible}
	<div class="drawer-handle-layer">
		<button
			class="drawer-handle"
			type="button"
			aria-expanded={open}
			aria-controls="drawer-panel"
			onclick={toggle}
		>
			<div class="drawer-pill"></div>
			<div class="drawer-title-row">
				<span class="drawer-title">{label}</span>
			</div>
		</button>
	</div>
{/if}

<dialog
	bind:this={dialog_ref}
	class="drawer-dialog"
	class:animating-open={is_animating_open}
	oncancel={handle_dialog_cancel}
	onclick={handle_backdrop_click}
>
	<div class="drawer-shell" role="complementary" aria-label={label}>
		<div class="drawer" ontransitionend={handle_transition_end}>
			<button
				class="drawer-handle"
				type="button"
				aria-expanded={open}
				aria-controls="drawer-panel"
				onclick={toggle}
			>
				<div class="drawer-pill"></div>
				<div class="drawer-title-row">
					<span class="drawer-title">{label}</span>
				</div>
			</button>

			<div id="drawer-panel" class="drawer-panel">
				<div class="drawer-content">
					{@render children?.({ close })}
				</div>
			</div>
		</div>
	</div>
</dialog>

<style>
	.drawer-handle-layer {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 100;
	}

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
		background: oklch(0% 0 0 / 0.18);
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
		transform: translateY(calc(100% - 2rem));
		transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
		will-change: transform;
	}

	.drawer-dialog.animating-open .drawer {
		transform: translateY(0);
	}

	.drawer-handle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		width: min(18rem, calc(100vw - 1rem));
		margin: 0 auto;
		padding: 0.35rem 0.85rem 0.45rem;
		border: 0;
		border-radius: 1rem 1rem 0 0;
		background: white;
		box-shadow:
			0 -8px 30px oklch(0% 0 0 / 0.12),
			0 -2px 10px oklch(0% 0 0 / 0.08);
		color: var(--foreground, black);
		cursor: pointer;
		touch-action: manipulation;
		pointer-events: auto;
	}

	.drawer-pill {
		width: 2rem;
		height: 0.22rem;
		border-radius: 999px;
		background: oklch(85% 0 0);
	}

	.drawer-title-row {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.78rem;
		font-weight: 600;
		line-height: 1;
	}

	.drawer-panel {
		width: 100%;
		max-height: min(70vh, 34rem);
		background: white;
		box-shadow: 0 -12px 40px oklch(0% 0 0 / 0.12);
		border-top: 1px solid oklch(92% 0 0);
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
			transform: translateY(calc(100% - 2.15rem));
		}

		.drawer-handle {
			width: min(18rem, calc(100vw - 0.75rem));
			border-radius: 1rem 1rem 0 0;
			padding-top: 0.4rem;
			padding-bottom: 0.5rem;
		}

		.drawer-panel {
			max-height: min(78vh, 40rem);
		}
	}
</style>
