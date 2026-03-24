<script>
	import { fade } from 'svelte/transition';

	/**
	 * @type {{
	 *   visible: boolean,
	 *   message: string,
	 *   done: boolean
	 * }}
	 */
	let { visible = false, message = '', done = false } = $props();

	let show_modal = $state(false);
	let delay_timer;

	// Show modal after 1s delay, or immediately if done (to flash success)
	$effect(() => {
		if (visible && !done) {
			delay_timer = setTimeout(() => {
				show_modal = true;
			}, 1000);
		} else if (visible && done) {
			clearTimeout(delay_timer);
			show_modal = true;
		} else {
			clearTimeout(delay_timer);
			show_modal = false;
		}

		return () => {
			clearTimeout(delay_timer);
		};
	});
</script>

{#if show_modal}
	<div
		class="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
	>
		<div
			class="max-w-md min-w-72 border border-(--foreground)/20 bg-(--background) px-10 py-8 text-center shadow-2xl"
		>
			{#if done}
				<div class="flex items-center justify-center gap-3">
					<svg
						class="h-6 w-6 shrink-0 text-green-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<p class="text-lg font-medium text-(--foreground)">{message}</p>
				</div>
			{:else}
				<div class="flex flex-col items-center gap-4">
					<!-- Spinner -->
					<div
						class="save-spinner h-8 w-8 animate-spin border-2 border-(--foreground)/20 border-t-(--foreground)"
					></div>
					<p class="text-lg text-(--foreground)">{message}</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.save-spinner {
		border-radius: 50%;
	}
</style>
