<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	let { node, path } = $props();

	let is_annotation = $derived(svedit.session.kind(node) === 'annotation');

	function handle_edit() {
		const edit_link_command = svedit.session.commands?.edit_link;
		if (edit_link_command) {
			edit_link_command.execute();
		}
	}

	function handle_remove() {
		if (is_annotation) {
			svedit.session.apply(svedit.session.tr.annotate_text('link'));
		} else {
			const tr = svedit.session.tr;
			tr.set([node.id, 'href'], '');
			svedit.session.apply(tr);
		}
	}
</script>

<div
	class="link-preview pointer-events-auto absolute z-30 mt-1"
	style="position-anchor: --{path.join(
		'-'
	)}; position-area: block-end span-all; justify-self: anchor-center;"
>
	{#if node.href}
		<div
			class="flex items-center gap-3 border-1 border-(--svedit-editing-stroke) bg-white px-3 py-2"
		>
			<a
				href={node.href}
				target="_blank"
				rel="noopener noreferrer"
				class="max-w-70 truncate text-sm text-gray-700 hover:underline"
			>
				{node.href}
			</a>
			<button
				type="button"
				class="shrink-0 cursor-pointer text-sm text-(--svedit-editing-stroke) hover:opacity-80"
				onclick={handle_edit}
			>
				EDIT
			</button>
			<button
				type="button"
				class="shrink-0 cursor-pointer text-sm text-(--svedit-editing-stroke) hover:opacity-80"
				onclick={handle_remove}
			>
				REMOVE
			</button>
		</div>
	{:else}
		<button
			type="button"
			class="cursor-pointer border-1 border-(--svedit-editing-stroke) bg-white px-12 py-2 text-sm text-(--svedit-editing-stroke) hover:bg-gray-50"
			onclick={handle_edit}
		>
			CREATE LINK
		</button>
	{/if}
</div>
