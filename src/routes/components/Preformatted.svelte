<script>
	import { Node, TextProperty } from 'svedit';
	import { TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	let { path, annotation: section = null } = $props();
	let padding_top_wide = $derived(!section || section?.is_start);
	let padding_bottom_wide = $derived(!section || section?.is_end);
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
				<TextProperty
					tag="pre"
					class="overflow-x-auto! wrap-normal! whitespace-pre! tab-2"
					path={[...path, 'content']}
					placeholder="Preformatted text"
				/>
			</div>
		</div>
	</div>
</Node>
