<script>
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_PAGE_PADDING_X, TW_PAGE_PADDING } from '../tailwind_theme.js';

	let { path } = $props();
</script>

<Node class="ew-descriptive-listing" {path}>
	<div class="mx-auto max-w-4xl bg-(--background) text-(--foreground)">
		<div class="px-5 sm:px-7 md:px-10 lg:px-14 py-10 sm:py-14 md:py-20 lg:py-28">
			<NodeArrayProperty class="flex flex-col" path={[...path, 'items']} />
		</div>
	</div>
</Node>
