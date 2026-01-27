<script>
	import { getContext } from 'svelte';
	import { NodeArrayProperty, Node, CustomProperty } from 'svedit';
	import { slide } from 'svelte/transition';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import Image from './Image.svelte';

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

	function toggle_mobile_menu() {
		mobile_menu_open = !mobile_menu_open;
	}

	function close_mobile_menu() {
		mobile_menu_open = false;
	}
</script>

<Node {path}>
	<div class="{TW_LIMITER}">
		<div class="flex items-stretch border-l border-r border-(--foreground-subtle) text-sm">
			<!-- Logo -->
			<div class="flex items-center flex-1 {TW_PAGE_PADDING_X} py-4">
				<CustomProperty path={[...path, 'logo']}>
					<svelte:element
						this={svedit.editable ? 'div' : 'a'}
						href={svedit.editable ? undefined : '/'}
						class="w-10 h-10 overflow-hidden block"
						contenteditable={svedit.editable ? 'false' : undefined}
					>
						<Image path={[...path, 'logo']} />
					</svelte:element>
				</CustomProperty>
			</div>

			<!-- Desktop menu (hidden on mobile) -->
			<NodeArrayProperty class="nav-items hidden md:flex items-stretch gap-x-3 py-4 {TW_PAGE_PADDING_X}" path={[...path, 'nav_items']} />

			<!-- Hamburger button (visible on mobile only) -->
			<button
				class="cursor-pointer flex md:hidden items-center justify-center {TW_PAGE_PADDING_X} py-4"
				onclick={toggle_mobile_menu}
				aria-label="Toggle menu"
				aria-expanded={mobile_menu_open}
			>
				{#if mobile_menu_open}
					<!-- Close icon -->
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<!-- Hamburger icon -->
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>

	<!-- Mobile menu overlay (read-only, visible when open, hidden on desktop) -->
	{#if mobile_menu_open}
		<div
			class="md:hidden fixed inset-0 bg-(--background) z-50"
			contenteditable="false"
			transition:slide={{ duration: 200 }}
		>
			<!-- Close button in top right -->
			<button
				class="cursor-pointer absolute top-4 right-4 p-2"
				onclick={close_mobile_menu}
				aria-label="Close menu"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<!-- Menu items -->
			<nav class="flex flex-col px-5 sm:px-7 pt-16">
				{#each nav_items as _node_id, index (index)}
					{@const item = svedit.session.get([...path, 'nav_items', index])}
					<a
						href={item.href || '#'}
						target={item.target}
						class="text-3xl font-semibold py-2"
						onclick={close_mobile_menu}
					>
						{item.label?.text || ''}
					</a>
				{/each}
			</nav>
		</div>
	{/if}
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
		text-align: center;
	}
</style>
