<script>
	import { getContext } from 'svelte';
	import { NodeArrayProperty, Node, CustomProperty } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import Image from './Image.svelte';

	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
</script>

<Node {path}>
	<div class="{TW_LIMITER}">
		<div class="flex items-stretch border-l border-r border-(--foreground-subtle)">
			<div class="w-1/4 flex items-center {TW_PAGE_PADDING_X} py-4">
				<CustomProperty path={[...path, 'logo']}>
					<div class="h-10 overflow-hidden" contenteditable="false">
						<Image path={[...path, 'logo']} />
					</div>
				</CustomProperty>
			</div>
			<NodeArrayProperty class="nav-items flex items-stretch flex-1" path={[...path, 'nav_items']} />
		</div>
	</div>
</Node>

<style>
	:global(.nav-items) {
		--layout-orientation: horizontal;
	}

	:global(.nav-items > *) {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		/*border-left: 1px solid var(--foreground-subtle);*/
		text-align: center;
	}

</style>
