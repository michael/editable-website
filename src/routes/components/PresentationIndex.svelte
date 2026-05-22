<script>
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AppToolbar from './AppToolbar.svelte';
	import Media from './Media.svelte';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';

	let { presentations = [], has_backend = true, is_admin = false } = $props();

	let items = $state([]);
	let search_query = $state('');
	let confirm_item = $state(null);
	let confirm_ref = $state(null);
	let deleting = $state(false);
	let delete_error = $state('');

	let normalized_search_query = $derived(search_query.trim().toLowerCase());
	let filtered_items = $derived(get_filtered_items());

	$effect(() => {
		items = presentations;
	});

	$effect(() => {
		if (confirm_item && confirm_ref && !confirm_ref.open) {
			confirm_ref.showModal();
		} else if (!confirm_item && confirm_ref?.open) {
			confirm_ref.close();
		}
	});

	function get_filtered_items() {
		if (!normalized_search_query) return items;

		return items.filter((item) => get_search_text(item).includes(normalized_search_query));
	}

	function get_search_text(item) {
		return `${item.title ?? ''} ${item.description ?? ''} ${item.document_id ?? ''} ${item.page_href ?? ''}`
			.trim()
			.toLowerCase();
	}

	function format_timestamp(value) {
		if (!value) return '';

		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;

		return date.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	function open_confirm(event, item) {
		event.preventDefault();
		event.stopPropagation();
		confirm_item = item;
		delete_error = '';
	}

	function close_confirm() {
		confirm_item = null;
		delete_error = '';
	}

	function handle_confirm_click(event) {
		if (event.target === confirm_ref) {
			close_confirm();
		}
	}

	function handle_confirm_cancel(event) {
		event.preventDefault();
		close_confirm();
	}


	async function confirm_delete() {
		if (!confirm_item) return;

		deleting = true;
		delete_error = '';

		try {
			const api_module = await import('$lib/api.remote.js');
			await api_module.delete_page({ document_id: confirm_item.document_id });
			items = items.filter((item) => item.document_id !== confirm_item.document_id);
			close_confirm();
			await invalidateAll();
		} catch (err) {
			delete_error = err instanceof Error ? err.message : 'Failed to delete presentation.';
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Presentations</title>
</svelte:head>

<div class="min-h-screen bg-(--background) text-(--foreground)">
	<AppToolbar {has_backend} {is_admin} allow_signed_out_new={true} />
	<div class={TW_LIMITER}>
		<div class="{TW_PAGE_PADDING_X} py-10 md:py-14 flex flex-col gap-8">
			<header class="flex flex-col gap-2">
				<h1 class="font-serif text-4xl md:text-6xl leading-none">Presentations</h1>
				<p class="max-w-2xl text-sm md:text-base text-[color-mix(in_oklch,var(--foreground)_72%,transparent)]">
					Browse all presentations.
				</p>
			</header>

			<label class="relative block max-w-2xl">
				<span class="sr-only">Search presentations</span>
				<svg
					class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color-mix(in_oklch,var(--foreground)_54%,transparent)]"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 15 15"
					fill="none"
					aria-hidden="true"
				>
					<circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor"></circle>
					<path d="M10 10L13 13" stroke="currentColor" stroke-linecap="square"></path>
				</svg>
				<input
					type="search"
					bind:value={search_query}
					placeholder={`Search ${items.length} presentations`}
					class="h-12 w-full border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] bg-(--background) pl-10 pr-4 text-base text-(--foreground) outline-1 outline-transparent placeholder:text-[color-mix(in_oklch,var(--foreground)_54%,transparent)] focus:border-(--svedit-editing-stroke) focus:outline-(--svedit-editing-stroke)"
				/>
			</label>

			<section class="flex flex-col gap-3" aria-label="Presentations">
				{#if filtered_items.length === 0}
					<div class="border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] px-5 py-8 text-sm text-[color-mix(in_oklch,var(--foreground)_72%,transparent)]">
						{#if items.length === 0}
							No presentations yet.
						{:else}
							No presentations match your search.
						{/if}
					</div>
				{:else}
					{#each filtered_items as item (item.document_id)}
						<article class="group grid gap-4 border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] bg-(--background) p-4 hover:border-(--svedit-editing-stroke) md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
							<a
								href={resolve(item.page_href)}
								class="grid gap-4 outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-2 md:grid-cols-[7rem_minmax(0,1fr)] md:items-center"
							>
								<div class="aspect-video border border-[color-mix(in_oklch,var(--foreground)_14%,transparent)] bg-[color-mix(in_oklch,var(--foreground)_4%,var(--background))]">
									{#if item.preview_media_node}
										<Media node={{ ...item.preview_media_node, object_fit: 'cover' }} />
									{:else}
										<div class="flex h-full items-center justify-center text-[color-mix(in_oklch,var(--foreground)_44%,transparent)]">
											<svg class="size-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="none" aria-hidden="true">
												<rect x="1.5" y="2.5" width="12" height="8" stroke="currentColor" />
												<path d="M4.5 13.5H10.5" stroke="currentColor" />
												<path d="M7.5 10.5V13.5" stroke="currentColor" />
											</svg>
										</div>
									{/if}
								</div>

								<div class="min-w-0 flex flex-col gap-1">
									<h2 class="truncate font-serif text-2xl md:text-3xl">{item.title}</h2>
									{#if item.description}
										<p class="line-clamp-2 text-sm text-[color-mix(in_oklch,var(--foreground)_72%,transparent)]">
											{item.description}
										</p>
									{/if}
									{#if item.updated_at}
										<div class="text-xs text-[color-mix(in_oklch,var(--foreground)_54%,transparent)]">
											Updated {format_timestamp(item.updated_at)}
										</div>
									{/if}
								</div>
							</a>

							{#if is_admin}
								<div class="flex items-center gap-2 md:justify-end">
									<button
										type="button"
										class="border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] px-3 py-2 text-xs uppercase tracking-widest text-(--svedit-editing-stroke) hover:border-(--svedit-editing-stroke) outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1"
										onclick={(event) => open_confirm(event, item)}
									>
										Delete
									</button>
								</div>
							{/if}
						</article>
					{/each}
				{/if}
			</section>
		</div>
	</div>
</div>

<dialog
	bind:this={confirm_ref}
	class="m-auto w-[min(34rem,calc(100vw-2rem))] border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] bg-(--background) p-0 text-(--foreground) shadow-xl"
	onclick={handle_confirm_click}
	oncancel={handle_confirm_cancel}
>
	<div class="flex flex-col gap-5 p-5">
		<div class="flex flex-col gap-2">
			<h2 class="font-serif text-2xl">Delete presentation?</h2>
			<p class="text-sm text-[color-mix(in_oklch,var(--foreground)_72%,transparent)]">
				Delete “{confirm_item?.title}”? This cannot be undone.
			</p>
			{#if delete_error}
				<p class="text-sm text-(--svedit-editing-stroke)">{delete_error}</p>
			{/if}
		</div>
		<div class="flex justify-end gap-2">
			<button
				type="button"
				class="border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] px-4 py-2 text-sm uppercase tracking-widest hover:border-(--svedit-editing-stroke)"
				onclick={close_confirm}
				disabled={deleting}
			>
				Cancel
			</button>
			<button
				type="button"
				class="border border-(--svedit-editing-stroke) px-4 py-2 text-sm uppercase tracking-widest text-(--svedit-editing-stroke) hover:bg-(--svedit-editing-stroke) hover:text-(--background) disabled:opacity-50"
				onclick={confirm_delete}
				disabled={deleting}
			>
				{deleting ? 'Deleting…' : 'Delete'}
			</button>
		</div>
	</div>
</dialog>

<style>
	dialog::backdrop {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
	}
</style>
