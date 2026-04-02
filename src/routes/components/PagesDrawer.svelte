<script>
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';

	const page_browser = getContext('page_browser');

	let {
		close_drawer = () => {},
		mode = 'navigate',
		on_select_page = null
	} = $props();

	let browser_data = $state(null);
	let loading = $state(false);
	let load_error = $state('');
	let loaded_version = $state(-1);

	$effect(() => {
		const current_version = page_browser?.version ?? 0;
		if (loading) return;
		if (browser_data && loaded_version === current_version) return;

		void load_browser_data();
	});

	async function load_browser_data() {
		loading = true;
		load_error = '';

		try {
			const api_module = await import('$lib/api.remote.js');
			browser_data = await api_module.get_page_browser_data();
			loaded_version = page_browser?.version ?? 0;
		} catch (err) {
			console.error('Failed to load page browser data', err);
			load_error = 'Failed to load pages.';
		} finally {
			loading = false;
		}
	}

	function get_page_count(sitemap) {
		if (!sitemap) return 0;

		let count = 1;
		for (const child of sitemap.children ?? []) {
			count += get_page_count(child);
		}
		return count;
	}

	async function handle_page_action(document_id) {
		if (mode === 'select') {
			close_drawer();
			if (on_select_page) {
				console.log('calling on_select_page...');
				on_select_page(document_id);
			}
			return;
		}

		close_drawer();
		await goto(`/${document_id}`);
	}

	async function handle_new_page() {
		close_drawer();
		await goto('/new');
	}

	function get_preview_src(preview_image_src) {
		if (!preview_image_src) return null;
		if (preview_image_src.startsWith('blob:')) return preview_image_src;
		return `/assets/${preview_image_src}`;
	}

	function is_video_preview(preview_image_src) {
		return !!preview_image_src && /\.(mp4|webm)$/i.test(preview_image_src);
	}

	const drafts = $derived(browser_data?.drafts ?? []);
	const sitemap = $derived(browser_data?.sitemap ?? null);
	const page_count = $derived(get_page_count(sitemap));
	const is_picker_mode = $derived(mode === 'select');
	const drawer_title = $derived(is_picker_mode ? 'Select page' : 'Pages');
</script>

<div class="pages-drawer">
	<section class="section">
		<div class="section-header">
			<h3>{drafts.length} drafts</h3>
			{#if is_picker_mode}
				<span class="section-mode-label">{drawer_title}</span>
			{/if}
		</div>

		{#if loading && !browser_data}
			<div class="status-message" role="status">Loading pages…</div>
		{:else if load_error}
			<div class="status-message" role="alert">{load_error}</div>
		{:else}
			<div class="drafts-strip" role="list" aria-label="Draft pages">
				{#if !is_picker_mode}
					<div role="listitem" class="draft-item">
						<button class="draft-card create-card" type="button" onclick={handle_new_page}>
							<div class="page-illustration draft-illustration create-illustration" aria-hidden="true">
								<div class="plus-glyph">+</div>
							</div>
							<div class="draft-title">New page</div>
						</button>
					</div>
				{/if}

				{#if drafts.length === 0}
					<div class="empty-state-card" role="listitem">
						<div class="empty-state-text">No drafts yet</div>
					</div>
				{:else}
					{#each drafts as draft}
						<div role="listitem" class="draft-item">
							<button class="draft-card" type="button" onclick={() => handle_page_action(draft.document_id)}>
								<div class="page-illustration draft-illustration" aria-hidden="true">
									{#if draft.preview_image_src}
										{#if is_video_preview(draft.preview_image_src)}
											<video
												class="media-preview"
												src={get_preview_src(draft.preview_image_src)}
												muted
												playsinline
												disablepictureinpicture
											></video>
										{:else}
											<img
												class="media-preview"
												src={get_preview_src(draft.preview_image_src)}
												alt=""
											/>
										{/if}
									{:else}
										<div class="page-sheet">
											<div class="line long"></div>
											<div class="line"></div>
											<div class="line short"></div>
										</div>
									{/if}
								</div>
								<div class="draft-title">{draft.title}</div>
							</button>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</section>

	<section class="section">
		<div class="section-header">
			<h3>{page_count} pages</h3>
		</div>

		{#if loading && !browser_data}
			<div class="status-message" role="status">Loading sitemap…</div>
		{:else if load_error}
			<div class="status-message" role="alert">{load_error}</div>
		{:else if !sitemap}
			<div class="status-message">No home page configured.</div>
		{:else}
			<div class="tree">
				{#snippet node_item(node, depth = 0)}
					<div class="tree-node" style={`--depth:${depth};`}>
						<button class="tree-row" type="button" onclick={() => handle_page_action(node.document_id)}>
							<div class="tree-indent" aria-hidden="true"></div>

							<div class="page-illustration tree-illustration" aria-hidden="true">
								{#if node.preview_image_src}
									{#if is_video_preview(node.preview_image_src)}
										<video
											class="media-preview"
											src={get_preview_src(node.preview_image_src)}
											muted
											playsinline
											disablepictureinpicture
										></video>
									{:else}
										<img
											class="media-preview"
											src={get_preview_src(node.preview_image_src)}
											alt=""
										/>
									{/if}
								{:else}
									<div class="page-sheet compact">
										<div class="line long"></div>
										<div class="line"></div>
										<div class="line short"></div>
									</div>
								{/if}
							</div>

							<div class="tree-label">{node.title}</div>
						</button>

						{#if node.children?.length}
							<div class="tree-children">
								{#each node.children as child}
									{@render node_item(child, depth + 1)}
								{/each}
							</div>
						{/if}
					</div>
				{/snippet}

				{@render node_item(sitemap)}
			</div>
		{/if}
	</section>
</div>

<style>
	.pages-drawer {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.section-header h3 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--foreground, black);
	}

	.section-mode-label {
		font-size: 0.78rem;
		font-weight: 600;
		color: oklch(45% 0 0);
	}

	.status-message {
		padding: 0.8rem 0;
		font-size: 0.9rem;
		color: oklch(45% 0 0);
	}

	.drafts-strip {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 8.4rem;
		gap: 1rem;
		overflow-x: auto;
		padding: 0.15rem 0.05rem 0.35rem;
		scrollbar-width: thin;
		-webkit-overflow-scrolling: touch;
	}

	.draft-item {
		display: block;
	}

	.empty-state-card {
		display: grid;
		place-items: center;
		min-height: 10rem;
		padding: 0.75rem;
		border: 1px dashed oklch(85% 0 0);
		background: oklch(99% 0 0);
	}

	.empty-state-text {
		font-size: 0.84rem;
		font-weight: 600;
		color: oklch(45% 0 0);
		text-align: center;
	}

	.draft-card,
	.tree-row {
		border: 0;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: background-color 140ms ease;
		outline: none;
	}

	.draft-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.65rem;
		width: 100%;
		padding: 0.45rem;
	}

	.tree-row {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		width: 100%;
		min-height: 3.35rem;
		padding: 0.45rem 0.6rem 0.45rem calc(0.6rem + var(--depth) * 1rem);
	}

	.draft-card:hover,
	.draft-card:focus-visible,
	.tree-row:hover,
	.tree-row:focus-visible {
		background: var(--svedit-editing-fill);
	}

	.page-illustration {
		display: grid;
		place-items: center;
		background: transparent;
		overflow: hidden;
	}

	.draft-illustration {
		width: 100%;
		aspect-ratio: 3 / 4;
		background: oklch(from var(--svedit-brand, oklch(60% 0.22 283)) 0.985 0.012 h);
		box-shadow: none;
	}

	.create-illustration {
		background: oklch(from var(--svedit-brand, oklch(60% 0.22 283)) 0.985 0.012 h);
		border: 1px dashed oklch(from var(--svedit-brand, oklch(60% 0.22 283)) 0.8 0.08 h / 0.45);
		box-shadow: none;
	}

	.tree-illustration {
		width: 2.65rem;
		aspect-ratio: 3 / 4;
		flex: 0 0 auto;
	}

	.media-preview {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		background: oklch(97% 0 0);
	}

	.page-sheet {
		width: 100%;
		height: 100%;
		background:
			linear-gradient(
				180deg,
				oklch(100% 0 0) 0%,
				oklch(98.5% 0 0) 100%
			);
		box-shadow:
			0 1px 2px oklch(0% 0 0 / 0.04),
			0 8px 18px oklch(0% 0 0 / 0.08),
			inset 0 0 0 1px oklch(90% 0 0);
		padding: 0.62rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.22rem;
	}

	.page-sheet.compact {
		padding: 0.42rem 0.34rem;
		gap: 0.16rem;
	}

	.line {
		height: 0.16rem;
		background: oklch(78% 0 0 / 0.75);
		margin-left: 0.04rem;
		margin-right: 0.04rem;
	}

	.page-sheet.compact .line {
		height: 0.11rem;
	}

	.line.long {
		width: 100%;
	}

	.line.short {
		width: 55%;
	}

	.plus-glyph {
		font-size: 2rem;
		line-height: 1;
		font-weight: 300;
		color: var(--svedit-brand, oklch(60% 0.22 283));
	}

	.draft-title {
		font-size: 0.8rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--foreground, black);
		text-align: center;
	}

	.tree {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.tree-node {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.tree-indent {
		width: 0;
		height: 0;
	}

	.tree-label {
		font-size: 0.92rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--foreground, black);
	}

	.tree-children {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	@media (max-width: 640px) {
		.drafts-strip {
			grid-auto-columns: 7.5rem;
			gap: 0.85rem;
		}

		.draft-card {
			padding: 0.4rem;
			gap: 0.55rem;
		}

		.draft-title {
			font-size: 0.74rem;
		}
	}
</style>
