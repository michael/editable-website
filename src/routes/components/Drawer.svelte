<script>
	/**
	 * Reusable bottom drawer / bottom sheet.
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

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}
</script>

<div class="drawer-layer" class:open>
	{#if open}
		<button
			class="drawer-backdrop"
			type="button"
			aria-label="Close drawer"
			onclick={close}
		></button>
	{/if}

	<div class="drawer" role="complementary" aria-label={label}>
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
				{@render children?.()}
			</div>
		</div>
	</div>
</div>

<style>
	.drawer-layer {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 100;
	}

	.drawer-backdrop {
		position: absolute;
		inset: 0;
		border: 0;
		background: oklch(0% 0 0 / 0.18);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
		pointer-events: auto;
	}

	.drawer {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: auto;
		transform: translateY(calc(100% - 2rem));
		transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
		will-change: transform;
	}

	.drawer-layer.open .drawer {
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