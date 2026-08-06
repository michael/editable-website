<script lang="ts">
	import { get_svedit_context } from '../svedit_context.js';
	import { get_app_context } from '../app_context.js';
	import { resolve } from '$app/paths';
	import type { PathnameWithSearchOrHash } from '$app/types';
	import { serialize_path } from 'svedit';
	import Media from './Media.svelte';

	const svedit = get_svedit_context();
	const app = get_app_context();

	let { node, path } = $props();

	let is_mark = $derived(svedit.session.kind(node) === 'mark');
	let internal_page_href = $derived(get_internal_page_href(node?.href));

	let page_preview = $derived.by(async () => {
		const href = internal_page_href;
		if (!app.has_backend) return null;
		if (!href) return null;

		const api_module = await import('#lib/api.remote.js');
		return await api_module.get_internal_link_preview(href);
	});

	function handle_edit() {
		const edit_link_command = svedit.session.commands?.edit_link;
		if (edit_link_command) {
			edit_link_command.execute();
		}
	}

	function handle_remove() {
		if (is_mark) {
			svedit.session.apply(svedit.session.tr.toggle_mark('link'));
		} else {
			const tr = svedit.session.tr;
			tr.set([node.id, 'href'], '');
			svedit.session.apply(tr);
		}
	}

	function get_internal_page_href(href) {
		if (typeof href !== 'string') return null;
		if (!href.startsWith('/')) return null;
		if (href.startsWith('//')) return null;

		const pathname = href.split(/[?#]/, 1)[0];
		if (!pathname || pathname === '/') return null;

		const segments = pathname.split('/').filter(Boolean);
		if (segments.length !== 1) return null;

		return href;
	}

	function get_preview_href(href: unknown) {
		if (typeof href !== 'string') return '';
		if (!href.startsWith('/') || href.startsWith('//')) return href;
		if (href === '/') return resolve('/');
		return resolve(href.slice(1) as PathnameWithSearchOrHash);
	}

	function get_preview_label(href: unknown) {
		if (typeof href !== 'string') return '';
		return href.replace(/^https?:\/\//, '');
	}
</script>

{#snippet render_link_preview(resolved_page_preview = null, error_message = '')}
	<div
		class="overflow-hidden rounded-full border border-(--border) bg-(--background) text-(--foreground) shadow-[0_1px_2px_rgb(0_0_0/0.12),0_4px_16px_rgb(0_0_0/0.08)]"
	>
		<div class="flex items-center gap-1 p-1">
			{#if internal_page_href}
				{#if resolved_page_preview}
					<a
						href={get_preview_href(internal_page_href)}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex h-9 max-w-70 min-w-0 flex-1 items-center rounded-full text-(--foreground) outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
					>
						{#if resolved_page_preview.preview_media_node?.src}
							<div class="size-9 shrink-0 overflow-hidden rounded-full">
								<Media node={{ ...resolved_page_preview.preview_media_node, object_fit: 'cover' }} />
							</div>
						{/if}
						<span class="min-w-0 truncate px-2 text-sm group-hover:underline">
							{resolved_page_preview.title}
						</span>
					</a>
				{:else}
					<div class="flex h-9 max-w-70 min-w-0 flex-1 items-center px-2 text-sm text-(--muted-foreground)">
						{error_message || 'No matching page.'}
					</div>
				{/if}
			{:else}
				<a
					href={get_preview_href(node.href)}
					target="_blank"
					rel="noopener noreferrer"
					class="max-w-70 min-w-0 flex-1 truncate px-2 text-sm text-(--foreground) outline-1 outline-transparent hover:underline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke)"
				>
					{get_preview_label(node.href)}
				</a>
			{/if}
			<button
				type="button"
				class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-(--foreground) outline-1 outline-transparent transition-all duration-150 hover:bg-(--muted) focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke) active:translate-y-px active:scale-95 active:bg-(--muted)"
				onclick={handle_edit}
				title="Edit link"
				aria-label="Edit link"
			>
				<svg
					class="size-6"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M4.5 19.5L5.25 15.25L15.75 4.75C16.7165 3.7835 18.2835 3.7835 19.25 4.75C20.2165 5.7165 20.2165 7.2835 19.25 8.25L8.75 18.75L4.5 19.5ZM14 6.5L17.5 10"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
			<button
				type="button"
				class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-(--foreground) outline-1 outline-transparent transition-all duration-150 hover:bg-(--muted) focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke) active:translate-y-px active:scale-95 active:bg-(--muted)"
				onclick={handle_remove}
				title="Remove link"
				aria-label="Remove link"
			>
				<svg
					class="size-6"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M5.5 7.5H18.5M9.5 4.5H14.5L15.5 7.5M7 7.5L7.75 19.5H16.25L17 7.5M10 10.5V16M14 10.5V16"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>
	</div>
{/snippet}

<div
	class="link-preview pointer-events-auto absolute z-30 mt-3"
	style="position-anchor: --{serialize_path(
		path
	)}; position-area: block-end span-all; justify-self: anchor-center;"
>
	{#if node.href}
		{#if internal_page_href}
			{#await page_preview}
				<!-- Keep the complete preview hidden while the page data resolves. -->
			{:then resolved_page_preview}
				{@render render_link_preview(resolved_page_preview)}
			{:catch err}
				{@render render_link_preview(
					null,
					err instanceof Error ? err.message : 'Failed to load page preview.'
				)}
			{/await}
		{:else}
			{@render render_link_preview()}
		{/if}
	{:else}
		<div
			class="rounded-full border border-(--border) bg-(--background) p-1 text-(--foreground) shadow-[0_1px_2px_rgb(0_0_0/0.12),0_4px_16px_rgb(0_0_0/0.08)]"
		>
			<button
				type="button"
				class="flex h-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent px-12 text-sm font-medium text-(--svedit-editing-stroke) outline-1 outline-transparent transition-all duration-150 hover:bg-(--muted) focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke) active:translate-y-px active:scale-[0.97] active:bg-(--muted)"
				onclick={handle_edit}
			>
				Create Link
			</button>
		</div>
	{/if}
</div>
