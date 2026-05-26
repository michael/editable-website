<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, Node } from 'svedit';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let message_text = $derived(node.message?.text ?? '');
	let message_lines = $derived(message_text.split('\n'));
	let visible_line_count = $state(0);
	let message_overflow_class = $derived(svedit.editable ? 'overflow-auto' : 'overflow-hidden');

	$effect(() => {
		const current_lines = message_lines;

		if (svedit.editable) {
			visible_line_count = current_lines.length;
			return;
		}

		visible_line_count = 0;
		if (current_lines.length === 0) return;

		let next_line_count = 0;
		const interval_id = setInterval(() => {
			next_line_count += 1;
			visible_line_count = Math.min(next_line_count, current_lines.length);

			if (next_line_count >= current_lines.length) {
				clearInterval(interval_id);
			}
		}, 650);

		return () => clearInterval(interval_id);
	});
</script>

<Node class="h-full min-h-0 overflow-hidden" {path}>
	<article
		class="flex h-full max-h-full min-h-0 flex-col overflow-hidden border border-(--foreground) bg-(--background) p-5 sm:p-6"
	>
		<div
			class="border-b border-(--foreground) pb-3 font-mono text-xs tracking-widest text-[color-mix(in_oklch,var(--foreground)_60%,transparent)] uppercase"
		>
			Chatbot
		</div>

		<div
			class="mt-4 max-h-full min-h-0 flex-1 border border-[color-mix(in_oklch,var(--foreground)_20%,transparent)] bg-[color-mix(in_oklch,var(--foreground)_6%,transparent)] p-4 font-mono text-sm leading-relaxed {message_overflow_class}"
		>
			{#if svedit.editable}
				<AnnotatedTextProperty
					tag="div"
					class="min-h-full whitespace-pre-wrap outline-none"
					path={[...path, 'message']}
					placeholder="Chat message"
				/>
			{:else}
				<div class="space-y-2" aria-live="polite">
					{#each message_lines.slice(0, visible_line_count) as line, index (index)}
						<p class="whitespace-pre-wrap">{line}</p>
					{/each}
				</div>
			{/if}
		</div>
	</article>
</Node>
