<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	let { path } = $props();

	let edit_media_command = $derived(svedit.session.commands?.edit_image);
	let target_node = $derived(svedit.session.get(path));
	let alt_input_value = $state('');
	let alt_input_ref = $state();
	let dialog_ref = $state();

	function save() {
		if (target_node?.type === 'image' || target_node?.type === 'video') {
			const tr = svedit.session.tr;
			tr.set([target_node.id, 'alt'], alt_input_value);
			svedit.session.apply(tr);
		}
		close();
	}

	function close() {
		if (edit_media_command) {
			edit_media_command.show_prompt = false;
		}
		svedit.focus_canvas();
	}

	function handle_keydown(event) {
		event.stopPropagation();

		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			save();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}

	function handle_backdrop_click(event) {
		if (event.target === dialog_ref) {
			close();
		}
	}

	$effect(() => {
		if (edit_media_command?.show_prompt && dialog_ref) {
			alt_input_value = target_node?.alt || '';
			dialog_ref.showModal();

			if (alt_input_ref) {
				alt_input_ref.focus();
				alt_input_ref.select();
			}
		} else if (dialog_ref?.open) {
			dialog_ref.close();
		}
	});
</script>

<dialog
	bind:this={dialog_ref}
	class="edit-media-dialog absolute z-40 mt-1 m-0 bg-(--background) text-(--foreground) p-0 shadow-xl overflow-visible max-h-90 border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)]"
	style="position-anchor: --{path.join('-')}; position-area: block-end span-all; justify-self: anchor-center;"
	onclick={handle_backdrop_click}
>
	<div class="flex flex-col">
		<div class="border-b border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] px-3 py-2">
			<div class="text-xs uppercase tracking-widest opacity-60">Alt text</div>
		</div>
		<div class="px-1 pt-1">
			<textarea
				bind:this={alt_input_ref}
				bind:value={alt_input_value}
				rows="3"
				placeholder="Describe the media for people using screen readers."
				class="w-72 min-w-0 border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] bg-(--background) px-3 py-2 text-sm text-(--foreground) resize-none focus:border-[var(--svedit-editing-stroke)] focus:outline-none focus:ring-0 focus:shadow-none"
				onkeydown={handle_keydown}
			></textarea>
		</div>
		<div class="flex items-center justify-end px-3 py-2 border-t border-[color-mix(in_oklch,var(--foreground)_18%,transparent)]">
			<button
				type="button"
				class="text-sm text-(--svedit-editing-stroke) cursor-pointer shrink-0 border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] px-2 py-1 hover:opacity-80 focus:border-[var(--svedit-editing-stroke)] focus:outline-none focus:ring-0 focus:shadow-none"
				onclick={save}
			>
				UPDATE
			</button>
		</div>
	</div>
</dialog>

<style>
	.edit-media-dialog::backdrop {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
	}
</style>