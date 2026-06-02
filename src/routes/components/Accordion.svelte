<script>
	import { Node, NodeArrayProperty } from 'svedit';
	import { TW_PAGE_PADDING_X, TW_PAGE_PADDING } from '../tailwind_theme.js';

	let { path } = $props();
</script>

<Node class="ew-accordion" {path}>
	<div class="mx-auto max-w-4xl bg-(--background) text-(--foreground)">
		<div class={TW_PAGE_PADDING}>
			<div class={TW_PAGE_PADDING_X}>
				<NodeArrayProperty class="flex flex-col" path={[...path, 'items']} />
			</div>
		</div>
	</div>
</Node>
