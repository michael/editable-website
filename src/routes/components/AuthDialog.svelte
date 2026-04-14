<script>
	/** @type {{
		open?: boolean,
		onclose?: () => void,
		onedit_for_fun?: () => void,
		onlogin_success?: () => Promise<void> | void
	}} */
	let {
		open = false,
		onclose = () => {},
		onedit_for_fun = () => {},
		onlogin_success = () => {}
	} = $props();

	/** @type {HTMLDialogElement | undefined} */
	let dialog_ref = $state();
	let password = $state('');
	let error = $state('');
	let pending = $state(false);

	$effect(() => {
		if (open && dialog_ref && !dialog_ref.open) {
			dialog_ref.showModal();
		} else if (!open && dialog_ref?.open) {
			dialog_ref.close();
		}
	});

	$effect(() => {
		if (open) return;
		password = '';
		error = '';
		pending = false;
	});

	function handle_dialog_cancel(event) {
		event.preventDefault();
		onclose();
	}

	function handle_dialog_click(event) {
		if (event.target === dialog_ref) {
			onclose();
		}
	}

	async function login_and_edit() {
		if (pending) return;

		pending = true;
		error = '';

		try {
			const api_module = await import('$lib/api.remote.js');
			const result = await api_module.login_admin({ password });

			if (result && result.ok === false && 'message' in result) {
				error = result.message || 'Login failed.';
				return;
			}

			await onlogin_success();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed.';
		} finally {
			pending = false;
		}
	}

	function handle_password_keydown(event) {
		if (event.key === 'Enter') {
			void login_and_edit();
		}
	}
</script>

<dialog
	bind:this={dialog_ref}
	class="fixed inset-0 m-auto border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] bg-(--background) p-0 text-(--foreground) shadow-xl backdrop:bg-black/40"
	oncancel={handle_dialog_cancel}
	onclick={handle_dialog_click}
>
	{#if open}
		<div class="flex w-[min(28rem,calc(100vw-2rem))] flex-col gap-4 p-5">
			<div class="flex flex-col gap-1">
				<h2 class="text-base font-medium">Edit this page</h2>
				<p class="text-sm text-[color-mix(in_oklch,var(--foreground)_70%,transparent)]">
					Enter the admin password to save changes, or edit for fun without saving.
				</p>
			</div>

			<label class="flex flex-col gap-2">
				<span class="text-sm">Admin password</span>
				<input
					type="password"
					bind:value={password}
					class="border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] bg-(--background) px-3 py-2 outline-none focus:border-(--svedit-editing-stroke)"
					onkeydown={handle_password_keydown}
				/>
			</label>

			{#if error}
				<div class="text-sm text-red-600">{error}</div>
			{/if}

			<div class="flex items-center justify-between gap-3">
				<button
					type="button"
					class="border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] px-3 py-2 text-sm"
					onclick={onedit_for_fun}
				>
					Edit for fun
				</button>

				<div class="flex items-center gap-2">
					<button
						type="button"
						class="border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] px-3 py-2 text-sm"
						onclick={onclose}
					>
						Cancel
					</button>
					<button
						type="button"
						class="bg-(--foreground) px-3 py-2 text-sm text-(--background)"
						onclick={() => void login_and_edit()}
						disabled={pending}
					>
						{pending ? 'Logging in…' : 'Login and edit'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</dialog>