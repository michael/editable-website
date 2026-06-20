<script>
	import { getContext } from 'svelte';
	import { NodeArrayProperty, Node } from 'svedit';
	import { slide } from 'svelte/transition';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
	let nav_items = $derived(node.nav_items || []);

	let mobile_menu_open = $state(false);

	$effect(() => {
		if (mobile_menu_open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<Node {path}>
	{#snippet menu_icon(open)}
		<svg class="w-6 h-6 stroke-(--foreground)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			{#if open}
				<path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
			{:else}
				<path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" d="M4 8h16M4 16h16" />
			{/if}
		</svg>
	{/snippet}

	<div class="{TW_LIMITER} overflow-x-auto overflow-y-hidden relative">
		<div class="flex items-stretch text-sm min-w-full">
			<NodeArrayProperty
				class="nav-items flex flex-1 min-w-0 items-stretch gap-x-2 sm:gap-x-4 py-3 {TW_PAGE_PADDING_X}"
				path={[...path, 'nav_items']}
			/>

			{#if !svedit.editable}
				<button
					class="cursor-pointer flex md:hidden items-center justify-center {TW_PAGE_PADDING_X} py-3"
					onclick={() => (mobile_menu_open = !mobile_menu_open)}
					aria-label="Toggle menu"
					aria-expanded={mobile_menu_open}
				>
					{@render menu_icon(mobile_menu_open)}
				</button>
			{/if}
		</div>

		{#if !svedit.editable && mobile_menu_open}
			<div
				class="md:hidden fixed inset-0 bg-(--background)/80 backdrop-blur-sm z-50"
				contenteditable="false"
				transition:slide={{ duration: 200 }}
			>
				<button
					class="cursor-pointer absolute top-4 right-4 p-2"
					onclick={() => (mobile_menu_open = false)}
					aria-label="Close menu"
				>
					{@render menu_icon(true)}
				</button>

				<nav class="flex flex-col pt-16 pb-5 px-3">
					{#each nav_items as _node_id, index (index)}
						{@const item = svedit.session.get([...path, 'nav_items', index])}
						{#if item.type === 'nav_item'}
							<a
								href={item.href || '#'}
								target={item.target}
								class="text-3xl font-serif text-(--foreground) py-2 px-3 sm:px-5"
								onclick={() => (mobile_menu_open = false)}
							>
								{item.label?.text || ''}
							</a>
						{/if}
					{/each}
				</nav>
			</div>
		{/if}
	</div>
</Node>

<style>
	:global(.nav-items) {
		--row: 1;
	}

	:global(.nav-items > *) {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
</style>
