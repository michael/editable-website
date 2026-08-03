<script lang="ts">
	import type { Nodes } from '#lib/document_schema.js';
	import { get_svedit_context } from '../svedit_context.js';
	import { Node, TextProperty } from 'svedit';
	import { TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import { split_code_comments } from '#lib/code_comments.js';

	// De-emphasize // and /* */ comments in code blocks (view mode only).
	// Set to false to render all preformatted text uniformly.
	const dim_code_comments = true;

	const svedit = get_svedit_context();
	let { path, mark: section = null } = $props();
	let node: Nodes['preformatted'] = $derived(svedit.session.get(path));
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
	let comment_segments = $derived(
		dim_code_comments && !svedit.editable ? split_code_comments(node.content?.content ?? '') : null
	);
</script>

<Node class="ew-preformatted bg-(--background) text-(--foreground)" {path}>
	<div class="mx-auto w-full max-w-7xl">
		<div
			class={[
				`${TW_PAGE_PADDING_X} px-4 sm:px-5 md:px-6`,
				padding_top_wide ? 'pt-section-wide' : 'pt-section-narrow',
				padding_bottom_wide ? 'pb-section-wide' : 'pb-section-narrow'
			]}
		>
			<div
				class="border border-(--border) bg-(--muted) p-3 font-mono text-sm subpixel-antialiased lg:p-6"
				style:border-radius="var(--image-border-radius)"
			>
				{#if comment_segments}
					<pre
						class="overflow-x-auto wrap-normal whitespace-pre tab-2">{#each comment_segments as segment, index (index)}{#if segment.comment}<span
									class="text-(--muted-foreground)">{segment.text}</span
								>{:else}{segment.text}{/if}{/each}</pre>
				{:else}
					<TextProperty
						tag="pre"
						class="overflow-x-auto! wrap-normal! whitespace-pre! tab-2"
						path={[...path, 'content']}
						placeholder="Preformatted text"
					/>
				{/if}
			</div>
		</div>
	</div>
</Node>
