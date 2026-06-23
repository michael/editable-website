<script>
	import { getContext } from 'svelte';
	import { NodeArrayProperty, Node } from 'svedit';
	import { slide } from 'svelte/transition';
	import { TW_LIMITER } from '../tailwind_theme.js';
	import NavImage from './NavImage.svelte';
	import NavItem from './NavItem.svelte';

	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
	let center_nav_item_ids = $derived(node.center_nav_items || []);
	let mobile_nav_image_path = $derived(find_mobile_nav_image_path());
	let mobile_nav_cta_path = $derived(find_mobile_nav_cta_path());
	let mobile_nav_open = $state(false);

	function find_mobile_nav_image_path() {
		for (const nav_items_name of ['start_nav_items', 'center_nav_items', 'end_nav_items']) {
			const nav_items = node?.[nav_items_name] || [];
			for (let index = 0; index < nav_items.length; index++) {
				const item = svedit.session.get([...path, nav_items_name, index]);
				if (item?.type === 'nav_image') {
					return [...path, nav_items_name, index];
				}
			}
		}

		return null;
	}

	function find_mobile_nav_cta_path() {
		for (const nav_items_name of ['start_nav_items', 'center_nav_items', 'end_nav_items']) {
			const nav_items = node?.[nav_items_name] || [];
			for (let index = 0; index < nav_items.length; index++) {
				const item = svedit.session.get([...path, nav_items_name, index]);
				if (item?.type === 'nav_item' && item.layout === 2) {
					return [...path, nav_items_name, index];
				}
			}
		}

		return null;
	}

	$effect(() => {
		if (mobile_nav_open) {
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


	<!-- Desktop nav (visible also during mobile editing) -->
	<div
		class="{TW_LIMITER} overflow-x-auto overflow-y-hidden relative"
		class:max-lg:hidden={!svedit.editable}
	>
		<div class="flex items-center gap-16 py-5 px-5 sm:px-7 text-sm">
			<NodeArrayProperty
				tag="div"
				class="flex flex-1 items-center *:min-w-max [--row:1]"
				path={[...path, 'start_nav_items']}
			/>
			<NodeArrayProperty
				tag="nav"
				class="flex items-center gap-8 w-max *:min-w-max [--row:1]"
				path={[...path, 'center_nav_items']}
			/>
			<NodeArrayProperty
				tag="div"
				class="flex flex-1 items-center justify-end gap-3 *:min-w-max [--row:1]"
				path={[...path, 'end_nav_items']}
			/>
		</div>
	</div>

	<!-- Mobile nav (visible also during mobile editing) -->
	<div
		class="{TW_LIMITER} lg:hidden"
		class:hidden={svedit.editable}
	>
		<div class="flex items-center gap-16 py-2 px-5 sm:px-7 text-sm">
			{#if mobile_nav_image_path}
				<NavImage path={mobile_nav_image_path} />
			{/if}
			<div class="flex-1"></div>
			<div class="flex items-center gap-3">
				{#if mobile_nav_cta_path}
					<NavItem path={mobile_nav_cta_path} />
				{/if}
					<button
						class="cursor-pointer flex items-center justify-center py-3"
						onclick={() => (mobile_nav_open = !mobile_nav_open)}
						aria-label="Toggle menu"
						aria-expanded={mobile_nav_open}
					>
						{@render menu_icon(mobile_nav_open)}
					</button>
				</div>
		</div>
	</div>

	{#if mobile_nav_open}
		<div
			class="lg:hidden fixed inset-0 bg-(--background)/80 backdrop-blur-sm z-50"
			contenteditable="false"
			transition:slide={{ duration: 200 }}
		>
			<button
				class="cursor-pointer absolute top-0 right-0 px-5 sm:px-7 py-5"
				onclick={() => (mobile_nav_open = false)}
				aria-label="Close menu"
			>
				{@render menu_icon(true)}
			</button>

			<nav class="flex flex-col pt-16 pb-5 px-3">
				{#each center_nav_item_ids as _node_id, index (index)}
					{@const item = svedit.session.get([...path, 'center_nav_items', index])}
					{#if item.type === 'nav_item'}
						<a
							href={item.href || '#'}
							target={item.target}
							class="text-3xl text-(--foreground) py-2 px-3 sm:px-5"
							onclick={() => (mobile_nav_open = false)}
						>
							{item.label?.text || ''}
						</a>
					{/if}
				{/each}
			</nav>
		</div>
	{/if}
</Node>
