<script>
	import { get_page_browser } from './page_browser_context.svelte.js';

	const page_browser = get_page_browser();

	let browser_data = $state(null);
	let loading = $state(false);
	let load_error = $state('');
	let loaded_version = $state(-1);

	let menu_item = $state(null);
	let menu_anchor_ref = $state(null);
	let menu_ref = $state(null);

	let confirm_item = $state(null);
	let confirm_ref = $state(null);
	let deleting = $state(false);
	let delete_error = $state('');

	let page_url_dialog_item = $state(null);
	let page_url_dialog_ref = $state(null);
	let page_url_value = $state('');
	let page_url_error = $state('');
	let saving_page_url = $state(false);

	$effect(() => {
		const current_version = page_browser?.version ?? 0;
		if (loading) return;
		if (browser_data && loaded_version === current_version) return;
		void load_browser_data();
	});

	$effect(() => {
		if (menu_item && menu_ref && !menu_ref.open) {
			menu_ref.showModal();
		} else if (!menu_item && menu_ref?.open) {
			menu_ref.close();
		}
	});

	$effect(() => {
		if (confirm_item && confirm_ref && !confirm_ref.open) {
			confirm_ref.showModal();
		} else if (!confirm_item && confirm_ref?.open) {
			confirm_ref.close();
		}
	});

	$effect(() => {
		if (page_url_dialog_item && page_url_dialog_ref && !page_url_dialog_ref.open) {
			page_url_dialog_ref.showModal();
		} else if (!page_url_dialog_item && page_url_dialog_ref?.open) {
			page_url_dialog_ref.close();
		}
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

	function get_page_count(node) {
		if (!node) return 0;

		let count = 1;
		for (const child of node.children ?? []) {
			count += get_page_count(child);
		}
		return count;
	}

	function get_page_href(document_id, slug) {
		return is_home_page(document_id) ? '/' : slug ? `/${slug}` : '/';
	}

	function get_resolved_page_href(document_id, slug) {
		return get_page_href(document_id, slug);
	}

	function get_page_slug_label(document_id, slug) {
		if (is_home_page(document_id)) return '/';
		return slug ? `/${slug}` : '/';
	}

	function get_preview_src(preview_image_src) {
		if (!preview_image_src) return null;
		if (preview_image_src.startsWith('blob:')) return preview_image_src;
		return `/assets/${preview_image_src}`;
	}

	function is_video_preview(preview_image_src) {
		return !!preview_image_src && /\.(mp4|webm)$/i.test(preview_image_src);
	}

	function is_home_page(document_id) {
		return browser_data?.home_page_id === document_id;
	}

	function handle_page_click(event, item) {
		if (!is_picker_mode) return;
		event.preventDefault();
		page_browser.handle_page_selected(item);
	}

	function open_menu(event, item) {
		event.preventDefault();
		event.stopPropagation();
		menu_anchor_ref = event.currentTarget;
		menu_item = item;
		delete_error = '';
		page_url_error = '';
	}

	function close_menu() {
		menu_item = null;
		menu_anchor_ref = null;
	}

	function open_confirm() {
		if (!menu_item || menu_item.is_home_page) return;
		confirm_item = menu_item;
		delete_error = '';
		close_menu();
	}

	function close_confirm() {
		confirm_item = null;
		delete_error = '';
	}

	function open_page_url_dialog() {
		if (!menu_item || menu_item.is_home_page) return;
		page_url_dialog_item = menu_item;
		page_url_value = menu_item.slug ?? '';
		page_url_error = '';
		close_menu();
	}

	function close_page_url_dialog() {
		page_url_dialog_item = null;
		page_url_value = '';
		page_url_error = '';
	}

	function handle_menu_click(event) {
		if (event.target === menu_ref) {
			close_menu();
		}
	}

	function handle_confirm_click(event) {
		if (event.target === confirm_ref) {
			close_confirm();
		}
	}

	function handle_page_url_dialog_click(event) {
		if (event.target === page_url_dialog_ref) {
			close_page_url_dialog();
		}
	}

	function handle_menu_cancel(event) {
		event.preventDefault();
		close_menu();
	}

	function handle_confirm_cancel(event) {
		event.preventDefault();
		close_confirm();
	}

	function handle_page_url_dialog_cancel(event) {
		event.preventDefault();
		close_page_url_dialog();
	}

	function open_in_new_tab() {
		if (!menu_item) return;
		window.open(
			get_resolved_page_href(menu_item.document_id, menu_item.slug),
			'_blank',
			'noopener,noreferrer'
		);
		close_menu();
	}

	function get_delete_confirmation_message() {
		if (!confirm_item) return '';
		if (confirm_item.kind === 'draft') {
			return 'Are you sure you want to delete this draft?';
		}
		return 'Are you sure you want to delete this page? It is still linked from other pages. Remove those links first if you want to avoid broken links.';
	}

	async function save_page_url(enforce_historical_alias = false) {
		if (!page_url_dialog_item || saving_page_url) return;

		saving_page_url = true;
		page_url_error = '';

		try {
			const api_module = await import('$lib/api.remote.js');
			const result = await api_module.update_page_slug({
				document_id: page_url_dialog_item.document_id,
				slug: page_url_value,
				enforce_historical_alias
			});

			if (result && result.ok === false && 'code' in result && 'message' in result) {
				if (
					!enforce_historical_alias &&
					result.code === 'page_url_historical_alias_reclaim_required'
				) {
					const confirmed = window.confirm(
						'This Page URL is currently a historical alias for another page. Reclaim it and redirect that old alias to this page instead?'
					);

					if (confirmed) {
						saving_page_url = false;
						await save_page_url(true);
						return;
					}
				}

				page_url_error = result.message || 'Failed to update Page URL.';
				return;
			}

			const updated_slug =
				result && 'slug' in result && typeof result.slug === 'string'
					? result.slug
					: page_url_value;
			const updated_document_id = page_url_dialog_item.document_id;

			close_page_url_dialog();
			browser_data = null;
			loaded_version = -1;
			page_browser.invalidate?.();
			page_browser.set_current_page({
				document_id: updated_document_id,
				slug: updated_slug
			});
			await load_browser_data();
		} catch (err) {
			console.error('Failed to update page URL', err);

			const error_body =
				typeof err === 'object' && err !== null && 'body' in err && typeof err.body === 'object'
					? err.body
					: null;

			const error_message =
				error_body &&
				'message' in error_body &&
				typeof error_body.message === 'string'
					? error_body.message
					: typeof err === 'object' &&
						  err !== null &&
						  'message' in err &&
						  typeof err.message === 'string'
						? err.message
						: err instanceof Error
							? err.message
							: 'Failed to update Page URL.';

			page_url_error = error_message;
		} finally {
			saving_page_url = false;
		}
	}

	async function confirm_delete() {
		if (!confirm_item || deleting || confirm_item.is_home_page) return;

		deleting = true;
		delete_error = '';

		try {
			const api_module = await import('$lib/api.remote.js');
			await api_module.delete_page({ document_id: confirm_item.document_id });

			const deleted_document_id = confirm_item.document_id;
			const home_page_id = browser_data?.home_page_id ?? null;

			close_confirm();
			browser_data = null;
			loaded_version = -1;
			page_browser.invalidate?.();
			await page_browser.handle_page_deleted?.(
				deleted_document_id,
				home_page_id,
				page_url_dialog_item?.document_id ?? confirm_item.document_id
			);
			await load_browser_data();
		} catch (err) {
			console.error('Failed to delete page', err);
			delete_error = err instanceof Error ? err.message : 'Failed to delete page.';
		} finally {
			deleting = false;
		}
	}

	const drafts = $derived(browser_data?.drafts ?? []);
	const sitemap = $derived(browser_data?.sitemap ?? null);
	const page_count = $derived(get_page_count(sitemap));
	const is_picker_mode = $derived(page_browser.state.mode === 'select');
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
						<a class="draft-card create-card" href="/new">
							<div class="page-illustration draft-illustration create-illustration" aria-hidden="true">
								<div class="plus-glyph">+</div>
							</div>
							<div class="draft-title">New page</div>
						</a>
					</div>
				{/if}

				{#if drafts.length === 0}
					<div class="empty-state-card" role="listitem">
						<div class="empty-state-text">No drafts yet</div>
					</div>
				{:else}
					{#each drafts as draft (draft.document_id)}
						<div role="listitem" class="draft-item">
							<div class="draft-card-shell">
								<a
									class="draft-card"
									href={get_resolved_page_href(draft.document_id, draft.slug)}
									onclick={(event) =>
										handle_page_click(event, {
											document_id: draft.document_id,
											slug: draft.slug
										})}
								>
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
									<div class="draft-title">
										<div>{draft.title}</div>
										<div class="page-slug-label">{get_page_slug_label(draft.document_id, draft.slug)}</div>
									</div>
								</a>

								{#if !is_picker_mode}
									<button
										type="button"
										class="item-actions-btn"
										aria-label={`Page actions for ${draft.title}`}
										onclick={(event) =>
											open_menu(event, {
												kind: 'draft',
												document_id: draft.document_id,
												slug: draft.slug,
												title: draft.title,
												is_home_page: false
											})}
									>
										⋯
									</button>
								{/if}
							</div>
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
						<div class="tree-row-shell">
							<a
								class="tree-row"
								href={get_resolved_page_href(node.document_id, node.slug)}
								onclick={(event) =>
									handle_page_click(event, {
										document_id: node.document_id,
										slug: node.slug
									})}
							>
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

								<div class="tree-label">
									<div>{node.title}</div>
									<div class="page-slug-label">{get_page_slug_label(node.document_id, node.slug)}</div>
								</div>
							</a>

							{#if !is_picker_mode}
								<button
									type="button"
									class="item-actions-btn tree-actions-btn"
									aria-label={`Page actions for ${node.title}`}
									onclick={(event) =>
										open_menu(event, {
											kind: 'page',
											document_id: node.document_id,
											slug: node.slug,
											title: node.title,
											is_home_page: is_home_page(node.document_id)
										})}
								>
									⋯
								</button>
							{/if}
						</div>

						{#if node.children?.length}
							<div class="tree-children">
								{#each node.children as child (child.document_id)}
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

<dialog
	bind:this={menu_ref}
	class="page-actions-dialog"
	oncancel={handle_menu_cancel}
	onclick={handle_menu_click}
>
	{#if menu_item}
		<div
			class="menu-panel"
			style={`position: fixed; top: ${menu_anchor_ref?.getBoundingClientRect().bottom ?? 0}px; left: ${Math.max((menu_anchor_ref?.getBoundingClientRect().right ?? 0) - 192, 8)}px;`}
		>
			<button type="button" class="menu-item" onclick={open_in_new_tab}>
				Open in new tab
			</button>
			<button
				type="button"
				class="menu-item {menu_item.is_home_page ? 'menu-item-disabled' : ''}"
				onclick={open_page_url_dialog}
				disabled={menu_item.is_home_page}
			>
				Edit URL
			</button>
			<button
				type="button"
				class="menu-item {menu_item.is_home_page ? 'menu-item-disabled' : 'menu-item-danger'}"
				onclick={open_confirm}
				disabled={menu_item.is_home_page}
			>
				Delete
			</button>
		</div>
	{/if}
</dialog>

<dialog
	bind:this={confirm_ref}
	class="confirm-dialog"
	oncancel={handle_confirm_cancel}
	onclick={handle_confirm_click}
>
	{#if confirm_item}
		<div class="confirm-panel">
			<h3 class="confirm-title">Delete page</h3>
			<p class="confirm-message">{get_delete_confirmation_message()}</p>
			{#if delete_error}
				<p class="confirm-error" role="alert">{delete_error}</p>
			{/if}
			<div class="confirm-actions">
				<button type="button" class="confirm-btn" onclick={close_confirm} disabled={deleting}>
					Cancel
				</button>
				<button
					type="button"
					class="confirm-btn confirm-btn-danger"
					onclick={confirm_delete}
					disabled={deleting}
				>
					{deleting ? 'Deleting…' : 'Delete'}
				</button>
			</div>
		</div>
	{/if}
</dialog>

<dialog
	bind:this={page_url_dialog_ref}
	class="confirm-dialog"
	oncancel={handle_page_url_dialog_cancel}
	onclick={handle_page_url_dialog_click}
>
	{#if page_url_dialog_item}
		<div class="confirm-panel">
			<h3 class="confirm-title">Edit URL</h3>
			<div class="page-url-field">
				<span class="page-url-prefix">example.com/</span>
				<input
					type="text"
					bind:value={page_url_value}
					class="page-url-input"
					placeholder="your-page-url"
				/>
			</div>
			{#if page_url_error}
				<p class="confirm-error" role="alert">{page_url_error}</p>
			{/if}
			<div class="confirm-actions">
				<button
					type="button"
					class="confirm-btn"
					onclick={close_page_url_dialog}
					disabled={saving_page_url}
				>
					Cancel
				</button>
				<button
					type="button"
					class="confirm-btn"
					onclick={() => save_page_url(false)}
					disabled={saving_page_url}
				>
					{saving_page_url ? 'Saving…' : 'Save'}
				</button>
			</div>
		</div>
	{/if}
</dialog>

<style>
	.pages-drawer {
		position: relative;
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
		color: inherit;
	}

	.section-mode-label {
		font-size: 0.78rem;
		font-weight: 600;
		color: color-mix(in oklch, currentColor 65%, transparent);
	}

	.status-message {
		padding: 0.8rem 0;
		font-size: 0.9rem;
		color: color-mix(in oklch, currentColor 65%, transparent);
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

	.draft-card-shell,
	.tree-row-shell {
		position: relative;
	}

	.empty-state-card {
		display: grid;
		place-items: center;
		min-height: 10rem;
		padding: 0.75rem;
		border: 1px dashed color-mix(in oklch, var(--foreground) 22%, transparent);
		background: color-mix(in oklch, var(--foreground) 3%, var(--background));
	}

	.empty-state-text {
		font-size: 0.84rem;
		font-weight: 600;
		color: color-mix(in oklch, currentColor 65%, transparent);
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
		padding-top: 2rem;
	}

	.tree-row {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		width: 100%;
		min-height: 3.35rem;
		padding: 0.45rem 2.5rem 0.45rem calc(0.6rem + var(--depth) * 1rem);
	}

	.draft-card:hover,
	.draft-card:focus-visible,
	.tree-row:hover,
	.tree-row:focus-visible {
		background: var(--svedit-editing-fill);
	}

	.item-actions-btn {
		position: absolute;
		top: 0.35rem;
		right: 0.35rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.9rem;
		height: 1.9rem;
		border: 0;
		background: color-mix(in oklch, var(--background) 88%, var(--foreground) 12%);
		color: inherit;
		cursor: pointer;
		font-size: 1.1rem;
		line-height: 1;
	}

	.tree-actions-btn {
		top: 50%;
		transform: translateY(-50%);
		right: 0.45rem;
	}

	.item-actions-btn:hover,
	.item-actions-btn:focus-visible {
		background: color-mix(in oklch, var(--foreground) 10%, var(--background));
		outline: none;
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
		background: color-mix(in oklch, var(--foreground) 3%, var(--background));
	}

	.page-sheet {
		width: 100%;
		height: 100%;
		background:
			linear-gradient(
				180deg,
				color-mix(in oklch, var(--background) 96%, white) 0%,
				color-mix(in oklch, var(--background) 92%, white) 100%
			);
		box-shadow:
			0 1px 2px color-mix(in oklch, black 8%, transparent),
			0 8px 18px color-mix(in oklch, black 10%, transparent),
			inset 0 0 0 1px color-mix(in oklch, var(--foreground) 12%, transparent);
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
		background: color-mix(in oklch, var(--foreground) 28%, transparent);
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
		color: inherit;
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
		color: inherit;
	}

	.tree-children {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.page-actions-dialog,
	.confirm-dialog {
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		max-width: none;
		max-height: none;
		width: 100vw;
		height: 100vh;
		overflow: visible;
	}

	.page-actions-dialog::backdrop,
	.confirm-dialog::backdrop {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
	}

	.menu-panel {
		position: fixed;
		display: flex;
		flex-direction: column;
		min-width: 12rem;
		background: var(--background);
		color: var(--foreground);
		border: 1px solid color-mix(in oklch, var(--foreground) 18%, transparent);
		box-shadow: 0 12px 30px color-mix(in oklch, black 12%, transparent);
	}

	.menu-item {
		border: 0;
		background: transparent;
		color: inherit;
		text-align: left;
		padding: 0.7rem 0.9rem;
		cursor: pointer;
		font-size: 0.92rem;
	}

	.menu-item:hover,
	.menu-item:focus-visible {
		background: color-mix(in oklch, var(--foreground) 10%, var(--background));
		outline: none;
	}

	.menu-item-danger {
		color: color-mix(in oklch, red 65%, var(--foreground));
	}

	.menu-item-disabled {
		color: color-mix(in oklch, var(--foreground) 45%, transparent);
		cursor: not-allowed;
	}

	.confirm-panel {
		position: fixed;
		inset: 50% auto auto 50%;
		transform: translate(-50%, -50%);
		width: min(28rem, calc(100vw - 2rem));
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		background: var(--background);
		color: var(--foreground);
		border: 1px solid color-mix(in oklch, var(--foreground) 18%, transparent);
		box-shadow: 0 12px 30px color-mix(in oklch, black 12%, transparent);
	}

	.confirm-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
	}

	.confirm-message {
		margin: 0;
		font-size: 0.92rem;
		line-height: 1.45;
		color: color-mix(in oklch, var(--foreground) 82%, transparent);
	}

	.confirm-error {
		margin: 0;
		font-size: 0.88rem;
		color: color-mix(in oklch, red 65%, var(--foreground));
	}

	.confirm-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.page-url-field {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 0;
	}

	.page-url-prefix {
		font-size: 0.95rem;
		color: color-mix(in oklch, currentColor 70%, transparent);
		white-space: nowrap;
	}

	.page-url-input {
		flex: 1;
		min-width: 0;
		border: 1px solid color-mix(in oklch, var(--foreground) 18%, transparent);
		background: var(--background);
		color: var(--foreground);
		padding: 0.5rem 0.65rem;
		font-size: 0.95rem;
		outline: none;
	}

	.page-url-input:focus {
		border-color: var(--svedit-editing-stroke);
	}

	.confirm-btn {
		border: 1px solid color-mix(in oklch, var(--foreground) 18%, transparent);
		background: transparent;
		color: inherit;
		padding: 0.55rem 0.9rem;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.confirm-btn:hover,
	.confirm-btn:focus-visible {
		background: color-mix(in oklch, var(--foreground) 10%, var(--background));
		outline: none;
	}

	.confirm-btn-danger {
		color: color-mix(in oklch, red 65%, var(--foreground));
		border-color: color-mix(in oklch, red 35%, var(--foreground) 12%, transparent);
	}

	.confirm-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.drafts-strip {
			grid-auto-columns: 7.5rem;
			gap: 0.85rem;
		}

		.draft-card {
			padding: 0.4rem;
			padding-top: 1.9rem;
			gap: 0.55rem;
		}

		.draft-title {
			font-size: 0.74rem;
		}
	}
</style>
