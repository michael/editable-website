<script>
	import { getContext } from 'svelte';
	import { NodeArrayProperty, Node, CustomProperty } from 'svedit';
	import { slide } from 'svelte/transition';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import Media from './Media.svelte';

	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));
	let nav_items = $derived(node.nav_items || []);
	let logo_node = $derived(svedit.session.get([...path, 'logo']));
	let logo_aspect_ratio = $derived(
		logo_node.width && logo_node.height
			? `${logo_node.width} / ${logo_node.height}`
			: '1 / 1'
	);

	let is_logo_selected = $derived(is_logo_selected_fn());

	function is_logo_selected_fn() {
		const path_of_selection = svedit?.session?.selection?.path?.join('.');
		const _logo_path = [...path, 'logo'].join('.');
		return path_of_selection == _logo_path;
	}

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

<Node class="mb-2" {path}>
	<div class="{TW_LIMITER}">
		<div class="flex items-stretch lg:text-lg">
			<!-- Logo -->
			<div class="flex items-center flex-1 {TW_PAGE_PADDING_X} py-3">
				<CustomProperty class="h-10" path={[...path, 'logo']}>
					<div
						contenteditable={svedit.editable ? 'false' : undefined}
						style:aspect-ratio={logo_aspect_ratio}
						class="overflow-hidden h-full"
						class:ew-bg-checkerboard={is_logo_selected || !logo_node.src}
					>
						<svelte:element
							this={svedit.editable ? 'div' : 'a'}
							href={svedit.editable ? undefined : '/'}
							class="block w-full h-full"
						>
							<Media path={[...path, 'logo']} mask={true} />
						</svelte:element>
					</div>
				</CustomProperty>
			</div>

			<!-- Desktop menu (hidden on mobile) -->
			<NodeArrayProperty class="nav-items hidden md:flex items-stretch gap-x-2 sm:gap-x-4 py-3 {TW_PAGE_PADDING_X}" path={[...path, 'nav_items']} />

			<!-- Hamburger button (visible on mobile only) -->
			<button
				class="cursor-pointer flex md:hidden items-center justify-center {TW_PAGE_PADDING_X} py-3"
				onclick={toggle_mobile_menu}
				aria-label="Toggle menu"
				aria-expanded={mobile_menu_open}
			>
				{#if mobile_menu_open}
					<!-- Close icon -->
					<svg class="w-6 h-6 stroke-(--foreground)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<!-- Hamburger icon (2 lines) -->
					<svg class="w-6 h-6 stroke-(--foreground)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" d="M4 8h16M4 16h16" />
					</svg>
				{/if}
			</button>
		</div>

	<!-- Mobile menu overlay (read-only, visible when open, hidden on desktop) -->
	{#if mobile_menu_open}
		<div
			class="md:hidden fixed inset-0 bg-(--background)/80 backdrop-blur-sm z-50"
			contenteditable="false"
			transition:slide={{ duration: 200 }}
		>
			<!-- Close button in top right -->
			<button
				class="cursor-pointer absolute top-4 right-4 p-2"
				onclick={close_mobile_menu}
				aria-label="Close menu"
			>
				<svg class="w-6 h-6 stroke-(--foreground)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<!-- Menu items -->
			<nav class="flex flex-col pt-16 pb-5 px-3">
				{#each nav_items as _node_id, index (index)}
					{@const item = svedit.session.get([...path, 'nav_items', index])}
					<a
						href={item.href || '#'}
						target={item.target}
						class="text-3xl font-serif text-(--foreground) py-2 px-3 sm:px-5"
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
		--row: 1;
	}

	:global(.nav-items > *) {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
</style>
