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
		<div class="bg-(--background) border border-(--foreground)/20 px-10 py-8 shadow-2xl min-w-72 max-w-md text-center">
			{#if done}
				<div class="flex items-center justify-center gap-3">
					<svg class="w-6 h-6 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					<p class="text-lg font-medium text-(--foreground)">{message}</p>
				</div>
			{:else}
				<div class="flex flex-col items-center gap-4">
					<!-- Spinner -->
					<div class="save-spinner w-8 h-8 border-2 border-(--foreground)/20 border-t-(--foreground) animate-spin"></div>
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