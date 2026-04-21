<script>
	/** @type {{
		onclose?: () => void,
		onedit_for_fun?: () => void,
		onlogin_success?: () => Promise<void> | void
	}} */
	let {
		onclose = () => {},
		onedit_for_fun = () => {},
		onlogin_success = () => {}
	} = $props();

	let password = $state('');
	let error = $state('');
	let pending = $state(false);
	let step = $state('choice');
	let password_input_ref = $state();
	let should_focus_password_input = $state(false);

	$effect(() => {
		if (step !== 'choice') return;

		requestAnimationFrame(() => {
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		});
	});

	$effect(() => {
		if (step !== 'login' || !password_input_ref || !should_focus_password_input) return;

		requestAnimationFrame(() => {
			password_input_ref?.focus();
			password_input_ref?.select();
			should_focus_password_input = false;
		});
	});

	function reset_dialog() {
		password = '';
		error = '';
		pending = false;
		step = 'choice';
		should_focus_password_input = false;
	}

	function close_auth_dialog() {
		reset_dialog();
		onclose();
	}

	function handle_edit_for_fun() {
		reset_dialog();
		onedit_for_fun();
	}

	function open_login_step() {
		step = 'login';
		error = '';
		password = '';
		should_focus_password_input = true;
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

			reset_dialog();
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

<div class="mx-auto flex w-full max-w-xl flex-col text-(--foreground)">
	{#if step === 'choice'}
		<div class="flex flex-col gap-3 px-1 pt-1 pb-2 sm:gap-5">
			<div class="flex flex-col gap-1">
				<h2 class="m-0 text-base leading-[1.3] font-medium">
					This is an
					<a
						href="https://editable.website"
						target="_blank"
						rel="noopener noreferrer"
						tabindex="-1"
						class="underline underline-offset-2 outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
					>
						editable.website
					</a>
				</h2>
			</div>

			<div class="grid w-full min-w-0 grid-cols-2 gap-2 sm:gap-3">
				<button
					type="button"
					class="flex w-full min-w-0 cursor-pointer flex-col justify-between overflow-hidden border border-[color-mix(in_oklch,var(--background)_91%,var(--foreground))] bg-(--background) px-2 py-3 text-center outline-1 outline-transparent transition-all duration-150 hover:bg-[color-mix(in_oklch,var(--background)_96%,var(--foreground))] hover:border-[color-mix(in_oklch,var(--background)_88%,var(--foreground))] active:translate-y-px active:scale-95 active:bg-[color-mix(in_oklch,var(--background)_94%,var(--foreground))] active:border-[color-mix(in_oklch,var(--background)_84%,var(--foreground))] focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1 sm:aspect-square sm:min-h-56 sm:p-5"
					onclick={handle_edit_for_fun}
				>
					<div class="flex h-14 items-center justify-center overflow-hidden sm:h-28">
						<svg
							viewBox="0 0 160 96"
							aria-hidden="true"
							class="h-full w-full scale-[0.68] text-[color-mix(in_oklch,var(--foreground)_62%,transparent)] sm:scale-100"
							fill="none"
							stroke="currentColor"
							stroke-width="1.25"
							stroke-linecap="square"
							stroke-linejoin="miter"
						>
							<rect x="34" y="20" width="34" height="44"></rect>
							<rect x="42" y="28" width="34" height="44"></rect>
							<line x1="92" y1="30" x2="122" y2="30"></line>
							<line x1="92" y1="40" x2="128" y2="40"></line>
							<line x1="92" y1="50" x2="120" y2="50"></line>
							<path d="M74 70 L86 58 L90 62 L78 74 Z"></path>
							<path d="M90 62 L96 56 L100 60 L94 66 Z"></path>
						</svg>
					</div>

					<div class="flex flex-col items-center gap-0.5 text-center sm:gap-1">
						<div class="text-[1rem] leading-none font-medium sm:text-2xl">Edit for fun</div>
						<div class="text-[0.68rem] leading-tight text-[color-mix(in_oklch,var(--foreground)_62%,transparent)] sm:text-sm">
							Changes can't be saved
						</div>
					</div>
				</button>

				<button
					type="button"
					class="flex w-full min-w-0 cursor-pointer flex-col justify-between overflow-hidden border border-[color-mix(in_oklch,var(--background)_91%,var(--foreground))] bg-(--background) px-2 py-3 text-center outline-1 outline-transparent transition-all duration-150 hover:bg-[color-mix(in_oklch,var(--background)_96%,var(--foreground))] hover:border-[color-mix(in_oklch,var(--background)_88%,var(--foreground))] active:translate-y-px active:scale-95 active:bg-[color-mix(in_oklch,var(--background)_94%,var(--foreground))] active:border-[color-mix(in_oklch,var(--background)_84%,var(--foreground))] focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1 sm:aspect-square sm:min-h-56 sm:p-5"
					onclick={open_login_step}
				>
					<div class="flex h-14 items-center justify-center overflow-hidden sm:h-28">
						<svg
							viewBox="0 0 160 96"
							aria-hidden="true"
							class="h-full w-full scale-[0.68] text-[color-mix(in_oklch,var(--foreground)_62%,transparent)] sm:scale-100"
							fill="none"
							stroke="currentColor"
							stroke-width="1.25"
							stroke-linecap="square"
							stroke-linejoin="miter"
						>
							<circle cx="58" cy="34" r="12"></circle>
							<path d="M38 68 C42 56, 52 50, 58 50 C64 50, 74 56, 78 68"></path>
							<rect x="92" y="38" width="34" height="26"></rect>
							<path d="M99 38 V31 C99 24, 103 20, 109 20 C115 20, 119 24, 119 31 V38"></path>
							<circle cx="109" cy="50" r="3"></circle>
							<line x1="109" y1="53" x2="109" y2="58"></line>
						</svg>
					</div>

					<div class="flex flex-col items-center gap-0.5 text-center sm:gap-1">
						<div class="text-[1rem] leading-none font-medium sm:text-2xl">Login</div>
						<div class="text-[0.68rem] leading-tight text-[color-mix(in_oklch,var(--foreground)_62%,transparent)] sm:text-sm">
							For admins
						</div>
					</div>
				</button>
			</div>
		</div>
	{:else}
		<div class="mx-auto flex w-full max-w-md flex-col gap-4 px-1 pt-1 pb-2">
			<div class="flex flex-col gap-1">
				<h2 class="m-0 text-base leading-[1.3] font-medium">Enter the admin password</h2>
			</div>

			<input
				type="password"
				bind:this={password_input_ref}
				bind:value={password}
				class="border border-[color-mix(in_oklch,var(--foreground)_12%,transparent)] bg-(--background) px-3 py-2 text-(--foreground) outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
				onkeydown={handle_password_keydown}
			/>

			{#if error}
				<div class="text-sm text-red-600">{error}</div>
			{/if}

			<div class="flex items-center justify-end gap-2">
				<button
					type="button"
					class="inline-flex cursor-pointer items-center justify-center border border-[color-mix(in_oklch,var(--background)_91%,var(--foreground))] bg-(--background) px-4 py-2 text-sm font-semibold text-(--foreground) shadow-sm outline-1 outline-transparent transition-all duration-150 hover:bg-[color-mix(in_oklch,var(--background)_96%,var(--foreground))] hover:border-[color-mix(in_oklch,var(--background)_88%,var(--foreground))] active:translate-y-px active:scale-95 active:bg-[color-mix(in_oklch,var(--background)_94%,var(--foreground))] active:border-[color-mix(in_oklch,var(--background)_84%,var(--foreground))] focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
					onclick={close_auth_dialog}
					disabled={pending}
				>
					Cancel
				</button>
				<button
					type="button"
					class="inline-flex cursor-pointer items-center justify-center border border-(--svedit-editing-stroke) bg-(--background) px-4 py-2 text-sm font-semibold text-(--svedit-editing-stroke) shadow-sm outline-1 outline-transparent transition-all duration-150 hover:bg-[color-mix(in_oklch,var(--foreground)_4%,var(--background))] active:translate-y-px active:scale-95 active:bg-[color-mix(in_oklch,var(--foreground)_7%,var(--background))] focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
					onclick={() => void login_and_edit()}
					disabled={pending}
				>
					{pending ? 'Logging in…' : 'Login'}
				</button>
			</div>
		</div>
	{/if}
</div>