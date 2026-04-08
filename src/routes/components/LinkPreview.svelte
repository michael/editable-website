<script>
	import { getContext } from 'svelte';
	import { VARIANT_WIDTHS } from '$lib/config.js';

	const svedit = getContext('svedit');
	const has_backend = getContext('has_backend');

	let { node, path } = $props();

	let is_annotation = $derived(svedit.session.kind(node) === 'annotation');
	let internal_page_id = $derived(get_internal_page_id(node?.href));

	let page_preview = $derived.by(async () => {
		if (!has_backend) return null;
		if (!internal_page_id) return null;

		const api_module = await import('$lib/api.remote.js');
		return api_module.get_internal_link_preview(`/${internal_page_id}`);
	});

	function handle_edit() {
		const edit_link_command = svedit.session.commands?.edit_link;
		if (edit_link_command) {
			edit_link_command.execute();
		}
	}

	function handle_remove() {
		if (is_annotation) {
			svedit.session.apply(svedit.session.tr.annotate_text('link'));
		} else {
			const tr = svedit.session.tr;
			tr.set([node.id, 'href'], '');
			svedit.session.apply(tr);
		}
	}

	function get_internal_page_id(href) {
		if (typeof href !== 'string') return null;
		if (!href.startsWith('/')) return null;

		const pathname = href.split(/[?#]/, 1)[0];
		if (!pathname || pathname === '/') return null;

		const page_id = pathname.slice(1);
		if (!page_id) return null;
		if (page_id.includes('/')) return null;

		return page_id;
	}

	function is_image_preview(preview_image_src) {
		return !!preview_image_src && !/\.(mp4|webm)$/i.test(preview_image_src);
	}

	function get_smallest_preview_image_src(preview_image_src) {
		if (!preview_image_src) return null;

		const original_url = `/assets/${preview_image_src}`;
		if (!preview_image_src.endsWith('.webp')) return original_url;

		const extension_index = preview_image_src.lastIndexOf('.');
		if (extension_index === -1) return original_url;

		const stem = preview_image_src.slice(0, extension_index);
		return `/assets/${stem}/w${VARIANT_WIDTHS[0]}.webp`;
	}
</script>

<div
	class="link-preview absolute z-30 mt-1 pointer-events-auto"
	style="position-anchor: --{path.join('-')}; position-area: block-end span-all; justify-self: anchor-center;"
>
	{#if node.href}
		<div class="bg-(--background) text-(--foreground) border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)]">
			<div class="flex items-center gap-3 px-3 py-2">
				<a
					href={node.href}
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm text-(--foreground) max-w-70 truncate hover:underline"
				>
					{node.href}
				</a>
				<button
					type="button"
					class="text-sm text-(--svedit-editing-stroke) cursor-pointer shrink-0 hover:opacity-80"
					onclick={handle_edit}
				>
					EDIT
				</button>
				<button
					type="button"
					class="text-sm text-(--svedit-editing-stroke) cursor-pointer shrink-0 hover:opacity-80"
					onclick={handle_remove}
				>
					REMOVE
				</button>
			</div>

			{#if internal_page_id}
				<div class="border-t border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] px-3 py-3">
					{#await page_preview}
						<div class="text-sm text-[color-mix(in_oklch,var(--foreground)_72%,transparent)]">Loading page preview…</div>
					{:then resolved_page_preview}
						{#if resolved_page_preview}
							<div class="flex items-center gap-3">
								{#if resolved_page_preview.preview_image_src && is_image_preview(resolved_page_preview.preview_image_src)}
									<img
										src={get_smallest_preview_image_src(resolved_page_preview.preview_image_src)}
										alt=""
										class="h-12 w-12 shrink-0 border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] object-cover"
									/>
								{/if}
								<div class="min-w-0">
									<div class="text-sm font-semibold text-(--foreground) truncate">
										{resolved_page_preview.title}
									</div>
								</div>
							</div>
						{:else}
							<div class="text-sm text-[color-mix(in_oklch,var(--foreground)_72%,transparent)]">No matching page.</div>
						{/if}
					{:catch}
						<div class="text-sm text-[color-mix(in_oklch,var(--foreground)_72%,transparent)]">No matching page.</div>
					{/await}
				</div>
			{/if}
		</div>
	{:else}
		<button
			type="button"
			class="bg-(--background) border border-[color-mix(in_oklch,var(--foreground)_18%,transparent)] text-(--svedit-editing-stroke) text-sm px-12 py-2 cursor-pointer hover:bg-[color-mix(in_oklch,var(--foreground)_10%,var(--background))]"
			onclick={handle_edit}
		>
			CREATE LINK
		</button>
	{/if}
</div>