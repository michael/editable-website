<script>
	import { getContext } from 'svelte';
	import { resolve } from '$app/paths';
	import { NodeArrayProperty, Node } from 'svedit';
	import { slide } from 'svelte/transition';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import MediaProperty from './MediaProperty.svelte';

	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
	let logo_node = $derived(svedit.session.get([...path, 'logo']));
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

	{#snippet nav_bar(editable = false)}
		<div class="{TW_LIMITER} overflow-x-auto overflow-y-hidden relative">
			<div class="flex w-full min-w-max items-center gap-16 py-5 {TW_PAGE_PADDING_X} text-sm">
				<div class="shrink-0">
					<svelte:element
						class="block h-10 min-w-0 outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
						style:aspect-ratio={logo_node?.width && logo_node?.height ? `${logo_node.width} / ${logo_node.height}` : '1 / 1'}
						this={svedit.editable ? 'div' : 'a'}
						href={svedit.editable ? undefined : resolve('/')}
					>
						<MediaProperty path={[...path, 'logo']} />
					</svelte:element>
				</div>

				<NodeArrayProperty
					tag="nav"
					class={editable ? 'mx-auto flex shrink-0 w-max items-center gap-8 [--row:1]' : 'mx-auto hidden shrink-0 w-max items-center gap-8 [--row:1] md:flex'}
					path={[...path, 'nav_items']}
				/>

				<div class="shrink-0">
					{#if !editable}
						<button
							class="cursor-pointer flex md:hidden items-center justify-center py-3"
							onclick={() => (mobile_menu_open = !mobile_menu_open)}
							aria-label="Toggle menu"
							aria-expanded={mobile_menu_open}
						>
							{@render menu_icon(mobile_menu_open)}
						</button>
					{/if}
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet mobile_menu()}
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
	{/snippet}

	{#if svedit.editable}
		{@render nav_bar(true)}
	{:else}
		{@render nav_bar(false)}

		{#if mobile_menu_open}
			{@render mobile_menu()}
		{/if}
	{/if}
</Node>

