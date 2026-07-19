<script lang="ts">
	import type { DocumentPath } from 'svedit';
	import { get_svedit_context } from '../svedit_context.js';
	import { serialize_path } from 'svedit';

	const svedit = get_svedit_context();

	let { path }: { path: DocumentPath } = $props();

	let edit_media_command = $derived(svedit.session.commands?.edit_image);
	let target_node = $derived(svedit.session.get(path));
	let alt_input_value = $state('');
	let alt_input_ref = $state<HTMLTextAreaElement>();
	let dialog_ref = $state<HTMLDialogElement>();

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
	class="edit-media-dialog absolute z-40 m-0 mt-1 max-h-90 overflow-visible border border-(--border) bg-(--background) p-0 text-(--foreground) shadow-xl"
	style="position-anchor: --{serialize_path(
		path
	)}; position-area: block-end span-all; justify-self: anchor-center;"
	onclick={handle_backdrop_click}
>
	<div class="flex flex-col">
		<div class="border-b border-(--border) px-3 py-2">
			<div class="text-xs tracking-widest uppercase opacity-60">Alt text</div>
		</div>
		<div class="px-1 pt-1">
			<textarea
				bind:this={alt_input_ref}
				bind:value={alt_input_value}
				rows="3"
				placeholder="Describe the media for people using screen readers."
				class="edit-media-textarea w-72 min-w-0 resize-none border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) focus:border-(--svedit-editing-stroke) focus:shadow-none focus:ring-0 focus:outline-none"
				onkeydown={handle_keydown}
			></textarea>
		</div>
		<div class="flex items-center justify-between border-t border-(--border) px-3 py-2">
			<div></div>
			<button
				type="button"
				class="shrink-0 cursor-pointer text-sm text-(--svedit-editing-stroke) outline-1 outline-transparent hover:opacity-80 focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
				onclick={save}
			>
				UPDATE
			</button>
		</div>
	</div>
</dialog>

<style>
	.edit-media-textarea {
		font-size: 16px !important;
	}

	.edit-media-dialog::backdrop {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
	}
</style>
