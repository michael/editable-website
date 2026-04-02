<script>
	import { getContext } from 'svelte';
	import { VARIANT_WIDTHS } from '$lib/config.js';

	const svedit = getContext('svedit');
	const has_backend = getContext('has_backend');

	let { node, path } = $props();

	let is_annotation = $derived(svedit.session.kind(node) === 'annotation');
	let internal_page_id = $derived(get_internal_page_id(node?.href));
	let page_preview_promises_by_id = new Map();

	let page_preview_promise = $derived.by(() => {
		if (!internal_page_id) return null;

		if (!page_preview_promises_by_id.has(internal_page_id)) {
			page_preview_promises_by_id.set(internal_page_id, load_page_preview(node.href));
		}

		return page_preview_promises_by_id.get(internal_page_id);
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
		if (!has_backend || typeof href !== 'string') return null;
		if (!href.startsWith('/')) return null;
		if (href === '/') return null;
		if (href.includes('?') || href.includes('#')) return null;

		const page_id = href.slice(1);
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

	async function load_page_preview(href) {
		const api_module = await import('$lib/api.remote.js');
		return api_module.get_internal_link_preview(href);
	}
</script>

<div
	class="link-preview absolute z-30 mt-1 pointer-events-auto"
	style="position-anchor: --{path.join('-')}; position-area: block-end span-all; justify-self: anchor-center;"
>
	{#if node.href}
		<div class="bg-white border border-(--svedit-editing-stroke)">
			<div class="flex items-center gap-3 px-3 py-2">
				<a
					href={node.href}
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm text-gray-700 max-w-70 truncate hover:underline"
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

			{#if page_preview_promise}
				<div class="border-t border-gray-200 px-3 py-3">
					{#await page_preview_promise}
						<div class="text-sm text-gray-500">Loading page preview…</div>
					{:then page_preview}
						{#if page_preview}
							<div class="flex items-center gap-3">
								{#if page_preview.preview_image_src && is_image_preview(page_preview.preview_image_src)}
									<img
										src={get_smallest_preview_image_src(page_preview.preview_image_src)}
										alt=""
										class="h-12 w-12 shrink-0 border border-gray-200 object-cover"
									/>
								{/if}
								<div class="min-w-0">
									<div class="text-sm font-semibold text-gray-900 truncate">{page_preview.title}</div>
								</div>
							</div>
						{:else}
							<div class="text-sm text-gray-500">Page not found.</div>
						{/if}
					{:catch}
						<div class="text-sm text-gray-500">Page not found.</div>
					{/await}
				</div>
			{/if}
		</div>
	{:else}
		<button
			type="button"
			class="bg-white border border-(--svedit-editing-stroke) text-(--svedit-editing-stroke) text-sm px-12 py-2 cursor-pointer hover:bg-gray-50"
			onclick={handle_edit}
		>
			CREATE LINK
		</button>
	{/if}
</div>
