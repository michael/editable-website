<script>
	import { Node, AnnotatedTextProperty } from 'svedit';
	import { TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	let { path } = $props();
</script>
<Node class="ew-preformatted bg-(--background) text-(--foreground)" {path}>
	<div class="mx-auto w-full max-w-7xl">
		<div class="{TW_PAGE_PADDING_X} py-10 sm:py-14 md:py-16 lg:py-28 px-4 sm:px-5 md:px-6">
			<div
				class="font-mono antialiased text-sm md:text-base p-10 border border-[color-mix(in_oklch,var(--foreground)_7%,transparent)] bg-[color-mix(in_oklch,var(--foreground)_1%,transparent)]"
				style:border-radius="var(--image-border-radius)"
			>
				<AnnotatedTextProperty
					tag='pre'
					class="whitespace-pre! wrap-normal! overflow-x-auto!"
					path={[...path, 'content']}
					placeholder="Preformatted text"
				/>
			</div>
		</div>
	</div>
</Node>
