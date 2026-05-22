<script>
	let { open = $bindable(false) } = $props();

	let dialog_ref = $state(null);

	$effect(() => {
		if (!dialog_ref) return;

		if (open && !dialog_ref.open) {
			dialog_ref.showModal();
		} else if (!open && dialog_ref.open) {
			dialog_ref.close();
		}
	});

	function close() {
		open = false;
	}

	function handle_backdrop_click(event) {
		if (event.target === dialog_ref) {
			close();
		}
	}

	function handle_cancel() {
		open = false;
	}
</script>

<dialog
	bind:this={dialog_ref}
	contenteditable="false"
	class="m-auto w-[min(34rem,calc(100vw-2rem))] border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] bg-(--background) p-0 text-(--foreground) shadow-xl"
	onclick={handle_backdrop_click}
	oncancel={handle_cancel}
>
	<div class="flex flex-col gap-5 p-6">
		<div class="flex items-start justify-between gap-6">
			<div class="flex flex-col gap-2">
				<h2 class="m-0 font-serif text-3xl leading-none">Hilfe</h2>
				<p class="text-sm text-[color-mix(in_oklch,var(--foreground)_68%,transparent)]">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				</p>
			</div>

			<button
				type="button"
				class="inline-flex size-9 shrink-0 items-center justify-center border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] text-(--foreground) outline-1 outline-transparent hover:border-(--svedit-editing-stroke) focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
				onclick={close}
				aria-label="Hilfe schließen"
			>
				<svg
					class="size-4"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 15 15"
					fill="none"
					aria-hidden="true"
				>
					<path d="M3.5 3.5L11.5 11.5M11.5 3.5L3.5 11.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="square" />
				</svg>
			</button>
		</div>

		<div class="space-y-4 text-base leading-relaxed text-[color-mix(in_oklch,var(--foreground)_82%,transparent)]">
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
			</p>
			<p>
				Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
			</p>
		</div>
	</div>
</dialog>

<style>
	dialog::backdrop {
		background: color-mix(in oklch, var(--foreground) 18%, transparent);
	}
</style>
