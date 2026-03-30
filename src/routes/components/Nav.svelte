<script>
	import { getContext } from 'svelte';
	import { NodeArrayProperty, Node, AnnotatedTextProperty } from 'svedit';
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

	function toggle_mobile_menu() {
		mobile_menu_open = !mobile_menu_open;
	}

	function close_mobile_menu() {
		mobile_menu_open = false;
	}
</script>

<Node {path}>
	<div class={TW_LIMITER}>
		<div class="flex items-stretch lg:text-lg">
			<!-- Logo -->
			<div class="flex flex-1 items-center {TW_PAGE_PADDING_X} py-7">
				<!-- <svelte:element
					this={svedit.editable ? 'div' : 'a'}
					href={svedit.editable ? undefined : '/'}
				>
					<MediaProperty class="h-10" path={[...path, 'logo']} sizing="fit" fallback_aspect_ratio="1 / 1" />
				</svelte:element> -->
				<AnnotatedTextProperty
					tag="h2"
					class="text-2xl font-semibold tracking-tight"
					path={[...path, 'company_name']}
					placeholder={svedit.editable ? 'Company name' : undefined}
				/>
			</div>

			<!-- Desktop menu (hidden on mobile) -->
			<NodeArrayProperty
				class="nav-items hidden items-stretch gap-x-2 py-5 py-7 sm:gap-x-4 md:flex {TW_PAGE_PADDING_X}"
				path={[...path, 'nav_items']}
			/>

			<!-- Hamburger button (visible on mobile only) -->
			<button
				class="flex cursor-pointer items-center justify-center md:hidden {TW_PAGE_PADDING_X} py-3"
				onclick={toggle_mobile_menu}
				aria-label="Toggle menu"
				aria-expanded={mobile_menu_open}
			>
				{#if mobile_menu_open}
					<!-- Close icon -->
					<svg
						class="h-6 w-6 stroke-(--foreground)"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="square"
							stroke-linejoin="miter"
							stroke-width="1.5"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				{:else}
					<!-- Hamburger icon (2 lines) -->
					<svg
						class="h-6 w-6 stroke-(--foreground)"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="square"
							stroke-linejoin="miter"
							stroke-width="1.5"
							d="M4 8h16M4 16h16"
						/>
					</svg>
				{/if}
			</button>
		</div>

		<!-- Mobile menu overlay (read-only, visible when open, hidden on desktop) -->
		{#if mobile_menu_open}
			<div
				class="fixed inset-0 z-50 bg-(--background)/80 backdrop-blur-sm md:hidden"
				contenteditable="false"
				transition:slide={{ duration: 200 }}
			>
				<!-- Close button in top right -->
				<button
					class="absolute top-4 right-4 cursor-pointer p-2"
					onclick={close_mobile_menu}
					aria-label="Close menu"
				>
					<svg
						class="h-6 w-6 stroke-(--foreground)"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="square"
							stroke-linejoin="miter"
							stroke-width="1.5"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<!-- Menu items -->
				<nav class="flex flex-col px-3 pt-16 pb-5">
					{#each nav_items as _node_id, index (index)}
						{@const item = svedit.session.get([...path, 'nav_items', index])}
						<a
							href={item.href || '#'}
							target={item.target}
							class="px-3 py-2 font-sans text-3xl text-(--foreground) sm:px-5"
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
