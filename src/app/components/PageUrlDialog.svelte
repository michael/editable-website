<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { get_app_context } from '#app/app_context.js';
	import { get_page_browser } from './page_browser_context.svelte.js';
	import { get_page_url_dialog } from './page_url_dialog_context.svelte.js';

	const app = get_app_context();
	const page_browser = get_page_browser();
	const page_url_dialog = get_page_url_dialog();

	let dialog_ref = $state(null);
	let page_url_value = $state('');
	let page_url_error = $state('');
	let saving = $state(false);

	let target = $derived(page_url_dialog.state.target);

	// Prefill whenever a new target is opened, keyed on the target itself so
	// reopening the same page resets an abandoned edit.
	$effect(() => {
		const current = page_url_dialog.state.target;
		page_url_value = current?.page_href ? current.page_href.replace(/^\//, '') : '';
		page_url_error = '';
	});

	$effect(() => {
		if (target && dialog_ref && !dialog_ref.open) {
			dialog_ref.showModal();
		} else if (!target && dialog_ref?.open) {
			dialog_ref.close();
		}
	});

	function close() {
		page_url_dialog.close();
	}

	function handle_click(event) {
		if (event.target === dialog_ref) {
			close();
		}
	}

	function handle_cancel(event) {
		event.preventDefault();
		close();
	}

	async function save() {
		const current = page_url_dialog.state.target;
		if (!current) return;

		saving = true;
		page_url_error = '';

		try {
			const api_module = await import('#lib/api.remote.js');
			const result = await api_module.update_page_slug({
				document_id: current.document_id,
				slug: page_url_value
			});

			if (result && result.ok === false && 'code' in result && 'message' in result) {
				page_url_error = result.message || 'Failed to update Page URL.';
				return;
			}

			current.on_saved?.();
			close();
			page_browser.invalidate?.();
			await invalidateAll();
		} catch (err) {
			page_url_error = err instanceof Error ? err.message : 'Failed to update Page URL.';
		} finally {
			saving = false;
		}
	}
</script>

<dialog
	bind:this={dialog_ref}
	class="confirm-dialog"
	oncancel={handle_cancel}
	onclick={handle_click}
>
	{#if target}
		<form
			class="confirm-panel"
			onsubmit={(event) => {
				event.preventDefault();
				void save();
			}}
		>
			<h3 class="confirm-title">Edit URL</h3>
			<div class="page-url-field">
				<span class="page-url-prefix">{app.origin || 'example.com'}/</span>
				<input
					type="text"
					bind:value={page_url_value}
					class="page-url-input"
					placeholder="your-page-url"
				/>
			</div>
			{#if page_url_error}
				<p class="confirm-error" role="alert">{page_url_error}</p>
			{/if}
			<div class="confirm-actions">
				<button type="button" class="confirm-btn" onclick={close} disabled={saving}>
					Cancel
				</button>
				<button type="submit" class="confirm-btn" disabled={saving}>
					{saving ? 'Saving…' : 'Save'}
				</button>
			</div>
		</form>
	{/if}
</dialog>

<style>
	.confirm-dialog {
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

	.confirm-dialog::backdrop {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
	}

	.confirm-panel {
		position: fixed;
		inset: 50% auto auto 50%;
		transform: translate(-50%, -50%);
		width: min(28rem, calc(100vw - 2rem));
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		border: 1px solid var(--border);
		border-radius: 23px;
		background: var(--background);
		color: var(--foreground);
		box-shadow:
			0 1px 2px rgb(0 0 0 / 0.12),
			0 4px 16px rgb(0 0 0 / 0.08);
	}

	.confirm-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
	}

	.confirm-error {
		margin: 0;
		font-size: 0.88rem;
		color: color-mix(in oklch, red 65%, var(--foreground));
	}

	.confirm-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.page-url-field {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 0;
	}

	.page-url-prefix {
		font-size: 0.95rem;
		color: var(--muted-foreground);
		white-space: nowrap;
	}

	.page-url-input {
		flex: 1;
		min-width: 0;
		border: 1px solid var(--border);
		border-radius: 9999px;
		background: var(--background);
		color: var(--foreground);
		padding: 0.5rem 0.65rem;
		font-size: 0.95rem;
		outline: none;
		box-shadow: none;
	}

	.page-url-input:focus {
		border-color: var(--svedit-editing-stroke);
		box-shadow: none;
	}

	.confirm-btn {
		border: 0;
		border-radius: 9999px;
		background: transparent;
		color: inherit;
		padding: 0.55rem 0.9rem;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
		outline: 1px solid transparent;
		outline-offset: 1px;
	}

	.confirm-btn:hover {
		background: var(--muted);
	}

	.confirm-btn:focus-visible {
		background: var(--muted);
		outline-color: var(--svedit-editing-stroke);
	}

	.confirm-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
