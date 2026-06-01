<script>
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	let { path } = $props();
</script>

<Node class="ew-descriptive-gallery" {path}>
	<div class="{TW_LIMITER} w-full">
		<div class="{TW_PAGE_PADDING_X} py-8 sm:py-10 md:py-12 lg:py-14">
			<NodeArrayProperty
				class="grid grid-cols-1 gap-16 [--row:1] md:grid-cols-2 md:gap-10 lg:gap-14 xl:grid-cols-3"
				path={[...path, 'items']}
			/>
		</div>
	</div>
</Node>
