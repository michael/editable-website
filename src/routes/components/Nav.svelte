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
	let show_edit_nav = $derived(svedit.editable);

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
	{#snippet logo()}
		<div class="flex items-center shrink-0 min-w-10 {TW_PAGE_PADDING_X} py-3">
			<svelte:element
				class="h-10 block min-w-0 outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
				style:aspect-ratio={logo_node.width && logo_node.height ? `${logo_node.width} / ${logo_node.height}` : '1 / 1'}
				this={svedit.editable ? 'div' : 'a'}
				href={svedit.editable ? undefined : resolve('/')}
			>
				<MediaProperty path={[...path, 'logo']} />
			</svelte:element>
		</div>
	{/snippet}

	{#snippet menu_icon(open)}
		<svg class="w-6 h-6 stroke-(--foreground)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			{#if open}
				<path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
			{:else}
				<path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" d="M4 8h16M4 16h16" />
			{/if}
		</svg>
	{/snippet}

	<!--
		Render exactly one <NodeArrayProperty path={[...path, 'nav_items']} /> at a
		time. Svedit requires that each path be mounted at most once per document,
		so we use {#if}/{:else} (not class:hidden) to ensure only one branch is in
		the DOM.
	-->
	{#if show_edit_nav}
		<div class="{TW_LIMITER} overflow-x-auto overflow-y-hidden">
			<div class="flex items-stretch lg:text-lg min-w-full">
				{@render logo()}
				<div class="flex-1"></div>
				<NodeArrayProperty class="nav-items flex items-stretch shrink-0 gap-x-2 sm:gap-x-4 py-3 pr-5 sm:pr-7 md:pr-10 lg:pr-14 min-w-max" path={[...path, 'nav_items']} />
			</div>
		</div>
	{:else}
		<div class="{TW_LIMITER}">
			<div class="flex items-stretch lg:text-lg min-w-full">
				{@render logo()}
				<div class="flex-1"></div>
				<NodeArrayProperty class="nav-items hidden md:flex items-stretch shrink-0 gap-x-2 sm:gap-x-4 py-3 {TW_PAGE_PADDING_X}" path={[...path, 'nav_items']} />

				<button
					class="cursor-pointer flex md:hidden items-center justify-center {TW_PAGE_PADDING_X} py-3"
					onclick={() => (mobile_menu_open = !mobile_menu_open)}
					aria-label="Toggle menu"
					aria-expanded={mobile_menu_open}
				>
					{@render menu_icon(mobile_menu_open)}
				</button>
			</div>

			{#if mobile_menu_open}
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
							<a
								href={item.href ? resolve(item.href) : '#'}
								target={item.target}
								class="text-3xl font-serif text-(--foreground) py-2 px-3 sm:px-5"
								onclick={() => (mobile_menu_open = false)}
							>
								{item.label?.text || ''}
							</a>
						{/each}
					</nav>
				</div>
			{/if}
		</div>
	{/if}
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
