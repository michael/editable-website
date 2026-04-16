<script>
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { get_page_browser_data } from '$lib/api.remote.js';
	import Media from './Media.svelte';
	import { get_page_browser } from './page_browser_context.svelte.js';

	const page_browser = get_page_browser();

	let browser_data = $state(null);
	let loading = $state(false);
	let load_error = $state('');
	let loaded_version = $state(-1);

	let menu_item = $state(null);
	let menu_anchor_name = $state('');
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

	let search_query = $state('');
	let search_input_ref = $state(null);
	let selected_result_index = $state(0);



	const browser_data_query = $derived.by(() => {
		page_browser?.version ?? 0;
		if (!page_browser.state.open) return null;
		return get_page_browser_data();
	});

	$effect(() => {
		const query = browser_data_query;

		if (!query) {
			loading = false;
			load_error = '';
			return;
		}

		loading = query.loading;
		load_error = query.error ? 'Failed to load pages.' : '';
		browser_data = query.current ?? null;
		loaded_version = page_browser?.version ?? 0;
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

	$effect(() => {
		if (!page_browser.state.open) return;

		search_query = '';

		if (!search_input_ref) return;

		requestAnimationFrame(() => {
			search_input_ref?.focus();
			search_input_ref?.select();
		});
	});

	function get_page_count(node) {
		if (!node) return 0;

		let count = 1;
		for (const child of node.children ?? []) {
			count += get_page_count(child);
		}
		return count;
	}

	function get_page_forest_count(nodes) {
		let count = 0;
		for (const node of nodes ?? []) {
			count += get_page_count(node);
		}
		return count;
	}

	function get_resolved_page_href(page_href) {
		return page_href || '/';
	}

	function get_page_slug_label(page_href) {
		return page_href || '/';
	}

	function is_home_page(document_id) {
		return browser_data?.home_page_id === document_id;
	}

	function has_children(node) {
		return !!node?.children?.length;
	}

	function is_root_node(node, depth) {
		return depth === 0;
	}

	function handle_page_click(event, item) {
		event.preventDefault();
		page_browser.handle_page_selected(item);
	}

	function get_menu_anchor_name(document_id) {
		return `--page-actions-${document_id}`;
	}

	function open_menu(event, item) {
		event.preventDefault();
		event.stopPropagation();
		menu_anchor_name = get_menu_anchor_name(item.document_id);
		menu_item = item;
		delete_error = '';
		page_url_error = '';
	}

	function close_menu() {
		menu_item = null;
		menu_anchor_name = '';
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
		page_url_value = menu_item.page_href ? menu_item.page_href.replace(/^\//, '') : '';
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
			event.preventDefault();
			event.stopPropagation();
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

	async function open_in_new_tab() {
		if (!menu_item?.page_href) return;
		window.open(get_resolved_page_href(menu_item.page_href), '_blank', 'noopener,noreferrer');
		close_menu();
	}

	async function save_page_url() {
		if (!page_url_dialog_item) return;

		saving_page_url = true;
		page_url_error = '';

		try {
			const api_module = await import('$lib/api.remote.js');
			const result = await api_module.update_page_slug({
				document_id: page_url_dialog_item.document_id,
				slug: page_url_value
			});

			if (result && result.ok === false && 'code' in result && 'message' in result) {
				page_url_error = result.message || 'Failed to update Page URL.';
				return;
			}

			close_page_url_dialog();
			browser_data = null;
			loaded_version = -1;
			page_browser.invalidate?.();
			await invalidateAll();
		} catch (err) {
			page_url_error = err instanceof Error ? err.message : 'Failed to update Page URL.';
		} finally {
			saving_page_url = false;
		}
	}

	function get_delete_confirmation_message() {
		if (!confirm_item) return '';
		return `Delete “${confirm_item.title}”? This cannot be undone.`;
	}

	async function confirm_delete() {
		if (!confirm_item) return;

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
			await invalidateAll();
			await page_browser.handle_page_deleted?.(
				deleted_document_id,
				home_page_id,
				page_url_dialog_item?.document_id ?? confirm_item.document_id
			);
		} catch (err) {
			delete_error = err instanceof Error ? err.message : 'Failed to delete page.';
		} finally {
			deleting = false;
		}
	}

	function get_count_label(count, singular_label, plural_label) {
		return `${count} ${count === 1 ? singular_label : plural_label}`;
	}

	function normalize_search_text(value) {
		return (value ?? '').trim().toLowerCase();
	}

	function get_page_search_text(item) {
		return `${item?.title ?? ''} ${item?.page_href ?? ''}`.trim().toLowerCase();
	}

	function item_matches_search(item, normalized_query) {
		if (!normalized_query) return false;
		return get_page_search_text(item).includes(normalized_query);
	}

	function get_highlight_parts(text, normalized_query) {
		const source_text = text ?? '';
		if (!normalized_query) {
			return [{ text: source_text, is_match: false }];
		}

		const lower_text = source_text.toLowerCase();
		const match_index = lower_text.indexOf(normalized_query);

		if (match_index === -1) {
			return [{ text: source_text, is_match: false }];
		}

		const parts = [];
		if (match_index > 0) {
			parts.push({ text: source_text.slice(0, match_index), is_match: false });
		}
		parts.push({
			text: source_text.slice(match_index, match_index + normalized_query.length),
			is_match: true
		});
		if (match_index + normalized_query.length < source_text.length) {
			parts.push({
				text: source_text.slice(match_index + normalized_query.length),
				is_match: false
			});
		}
		return parts;
	}

	function filter_page_forest_node(node, normalized_query) {
		if (!node) return null;

		if (!normalized_query) {
			return {
				...node,
				match_kind: 'none',
				children: (node.children ?? []).map((child) =>
					filter_page_forest_node(child, normalized_query)
				)
			};
		}

		const self_matches = item_matches_search(node, normalized_query);

		if (self_matches) {
			return {
				...node,
				match_kind: 'direct',
				children: (node.children ?? []).map((child) => ({
					...child,
					match_kind: 'descendant_context',
					children: mark_descendant_context(child.children ?? [])
				}))
			};
		}

		const filtered_children = [];
		for (const child of node.children ?? []) {
			const filtered_child = filter_page_forest_node(child, normalized_query);
			if (filtered_child) {
				filtered_children.push(filtered_child);
			}
		}

		if (filtered_children.length > 0) {
			return {
				...node,
				match_kind: 'ancestor_context',
				children: filtered_children
			};
		}

		return null;
	}

	function filter_page_forest(nodes, normalized_query) {
		if (!normalized_query) {
			return (nodes ?? []).map((node) => filter_page_forest_node(node, normalized_query));
		}

		const filtered_nodes = [];
		for (const node of nodes ?? []) {
			const filtered_node = filter_page_forest_node(node, normalized_query);
			if (filtered_node) {
				filtered_nodes.push(filtered_node);
			}
		}
		return filtered_nodes;
	}

	function mark_descendant_context(children) {
		return children.map((child) => ({
			...child,
			match_kind: 'descendant_context',
			children: mark_descendant_context(child.children ?? [])
		}));
	}

	function get_match_kind_class(match_kind) {
		if (match_kind === 'direct') return 'tree-row-match-direct';
		if (match_kind === 'ancestor_context') return 'tree-row-match-context';
		if (match_kind === 'descendant_context') return 'tree-row-match-context';
		return '';
	}

	function flatten_page_forest_results(nodes) {
		const results = [];

		for (const node of nodes ?? []) {
			results.push({
				document_id: node.document_id,
				page_href: node.page_href,
				title: node.title
			});

			for (const child of node.children ?? []) {
				results.push(...flatten_page_forest_results([child]));
			}
		}

		return results;
	}

	function get_visible_results(filtered_page_forest) {
		return flatten_page_forest_results(filtered_page_forest);
	}

	function get_visible_result_index(document_id, visible_results) {
		return visible_results.findIndex((result) => result.document_id === document_id);
	}

	function clamp_selected_result_index(index, visible_results) {
		if (visible_results.length === 0) return 0;
		return Math.min(Math.max(index, 0), visible_results.length - 1);
	}

	function handle_search_keydown(event, visible_results) {
		if (visible_results.length === 0) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selected_result_index = clamp_selected_result_index(
				selected_result_index + 1,
				visible_results
			);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			selected_result_index = clamp_selected_result_index(
				selected_result_index - 1,
				visible_results
			);
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			const selected_result = visible_results[selected_result_index];
			if (!selected_result) return;

			page_browser.handle_page_selected({
				document_id: selected_result.document_id,
				page_href: selected_result.page_href
			});
		}
	}

	let normalized_search_query = $derived(normalize_search_text(search_query));
	let page_forest = $derived(browser_data?.page_forest ?? []);
	let filtered_page_forest = $derived(filter_page_forest(page_forest, normalized_search_query));
	let visible_results = $derived(get_visible_results(filtered_page_forest));
	let page_count = $derived(get_page_forest_count(page_forest));
	let filtered_page_count = $derived(get_page_forest_count(filtered_page_forest));
	let is_picker_mode = $derived(page_browser.state.mode === 'select');
	let drawer_title = $derived(is_picker_mode ? 'Select page' : 'Pages');

	$effect(() => {
		selected_result_index = clamp_selected_result_index(selected_result_index, visible_results);
	});
</script>

<div class="pages-drawer">
	<div class="search-shell">
		<input
			bind:this={search_input_ref}
			type="search"
			class="search-input"
			bind:value={search_query}
			placeholder={`Search ${page_count} pages`}
			aria-label={`Search ${page_count} pages`}
			onkeydown={(event) => handle_search_keydown(event, visible_results)}
		/>
	</div>

	<section class="section">
		{#if loading && !browser_data}
			<div class="status-message" role="status">Loading pages…</div>
		{:else if load_error}
			<div class="status-message" role="alert">{load_error}</div>
		{:else}
			<div class="tree">


				{#snippet node_item(node, depth = 0, is_last = true, ancestor_columns = [])}
					{@const node_has_children = has_children(node)}
					{@const node_is_root = is_root_node(node, depth)}
					{@const current_column_continues = node_is_root ? false : !is_last || node_has_children}
					<div class="tree-node">
						<div class="tree-row-shell">
							<a
								class={`tree-row ${get_match_kind_class(node.match_kind)}`}
								class:tree-row-root={node_is_root}
								class:tree-row-keyboard-selected={visible_results[selected_result_index]?.document_id === node.document_id}
								href={resolve(get_resolved_page_href(node.page_href))}
								onclick={(event) =>
									handle_page_click(event, {
										document_id: node.document_id,
										page_href: node.page_href
									})}
								onmousemove={() => {
									selected_result_index = get_visible_result_index(node.document_id, visible_results);
								}}
							>
								<div class="tree-guides" aria-hidden="true">
									{#each ancestor_columns as show_rail, guide_index (`${depth}-${guide_index}`)}
										<div class="tree-guide-column">
											{#if show_rail}
												<div class="tree-guide-rail"></div>
											{/if}
										</div>
									{/each}

									{#if !node_is_root}
										<div class="tree-gutter">
											<div class="tree-gutter-rail tree-gutter-rail-top"></div>
											{#if current_column_continues}
												<div class="tree-gutter-rail tree-gutter-rail-bottom"></div>
											{/if}
											<div class="tree-gutter-elbow"></div>
											{#if !node_has_children}
												<div class="tree-leaf-dot"></div>
											{/if}
										</div>
									{/if}
								</div>

								<div class="page-illustration tree-illustration" aria-hidden="true">
									{#if node.preview_media_node}
										<div class="media-preview">
											<Media node={node.preview_media_node} />
										</div>
									{:else}
										<div class="page-illustration-fallback">
											<div class="page-symbol">
												<div class="page-symbol-line page-symbol-line-short"></div>
												<div class="page-symbol-line"></div>
												<div class="page-symbol-line"></div>
											</div>
										</div>
									{/if}
								</div>

								<div class="tree-label">
									<div class="tree-title" title={node.title}>
										{#each get_highlight_parts(node.title, normalized_search_query) as part, part_index (`title-${node.document_id}-${part_index}`)}
											<span class:match-highlight={part.is_match}>{part.text}</span>
										{/each}
									</div>
								</div>

								<div class="tree-row-meta">
									<div class="page-slug-label page-slug-label-right" title={get_page_slug_label(node.page_href)}>
										{#each get_highlight_parts(get_page_slug_label(node.page_href), normalized_search_query) as part, part_index (`slug-${node.document_id}-${part_index}`)}
											<span class:match-highlight={part.is_match}>{part.text}</span>
										{/each}
									</div>
								</div>
							</a>

							{#if !is_picker_mode}
								<button
									type="button"
									class="item-actions-btn tree-actions-btn"
									style={`anchor-name: ${get_menu_anchor_name(node.document_id)};`}
									aria-label={`Page actions for ${node.title}`}
									onclick={(event) =>
										open_menu(event, {
											kind: 'page',
											document_id: node.document_id,
											page_href: node.page_href,
											title: node.title,
											is_home_page: is_home_page(node.document_id)
										})}
								>
									<span class="tree-actions-dots">⋯</span>
								</button>

							{/if}
						</div>

						{#if node_has_children}
							<div class="tree-children">
								{#each node.children as child, index (child.document_id)}
									{@render node_item(
										child,
										depth + 1,
										index === node.children.length - 1,
										[...ancestor_columns, current_column_continues]
									)}
								{/each}
							</div>
						{/if}
					</div>
				{/snippet}

				{#if normalized_search_query && filtered_page_forest.length === 0}
					<div class="status-message">No matching pages.</div>
				{:else if !normalized_search_query && page_forest.length === 0}
					<div class="status-message">No pages yet.</div>
				{:else}
					{#each filtered_page_forest as root_node, index (root_node.document_id)}
						{@render node_item(root_node, 0, index === filtered_page_forest.length - 1, [])}
					{/each}
				{/if}
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
			style={`position-anchor: ${menu_anchor_name}; position-area: block-end span-all; justify-self: anchor-center; position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;`}
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
					onclick={save_page_url}
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
		gap: 1.25rem;
	}

	.search-shell {
		position: sticky;
		top: 0;
		z-index: 1;
		padding-top: 0.1rem;
		background: var(--background);
	}

	.search-input {
		width: 100%;
		border: 1px solid color-mix(in oklch, var(--foreground) 14%, transparent);
		background: color-mix(in oklch, var(--foreground) 2%, var(--background));
		color: var(--foreground);
		padding: 0.55rem 0.7rem;
		font-size: 0.88rem;
		outline: none;
	}

	.search-input:focus {
		border-color: var(--svedit-editing-stroke);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.status-message {
		padding: 0.8rem 0;
		font-size: 0.9rem;
		color: color-mix(in oklch, currentColor 65%, transparent);
	}

	.tree-row-shell {
		position: relative;
	}

	.tree-row {
		border: 0;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: background-color 140ms ease;
		outline: none;
	}

	.tree-row {
		display: flex;
		align-items: center;
		gap: 0;
		width: 100%;
		min-width: 0;
		min-height: 2.95rem;
		padding: 0 2.5rem 0 0;
	}

	.tree-row-meta {
		margin-left: auto;
		min-width: 0;
		max-width: 7rem;
		flex: 0 1 7rem;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-left: 0.75rem;
		padding-right: 1rem;
	}

	.tree-row-root {
		padding-left: 0;
	}

	.tree-row:hover,
	.tree-row:focus-visible {
		background: var(--svedit-editing-fill);
	}

	.draft-card-match-direct,
	.tree-row-match-direct {
		background: color-mix(in oklch, var(--svedit-editing-fill) 72%, var(--background));
	}

	.draft-card-keyboard-selected,
	.tree-row-keyboard-selected {
		outline: 1px solid var(--svedit-editing-stroke);
		outline-offset: -1px;
		background: color-mix(in oklch, var(--svedit-editing-fill) 82%, var(--background));
	}

	.tree-row-match-context {
		background: color-mix(in oklch, var(--foreground) 4%, var(--background));
	}

	.item-actions-btn {
		position: absolute;
		top: 0.35rem;
		right: 0.35rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: 0;
		padding: 0;
		background: transparent;
		color: color-mix(in oklch, currentColor 34%, transparent);
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
		opacity: 1;
		pointer-events: auto;
		transition: color 140ms ease, opacity 140ms ease;
	}

	.tree-actions-btn {
		top: 50%;
		transform: translateY(-50%);
		right: 0.7rem;
	}

	.tree-row-shell:hover .item-actions-btn,
	.tree-row-shell:focus-within .item-actions-btn,
	.tree-row:hover + .item-actions-btn,
	.tree-row:focus-visible + .item-actions-btn,
	.item-actions-btn:hover,
	.item-actions-btn:focus-visible {
		opacity: 1;
		pointer-events: auto;
		color: color-mix(in oklch, currentColor 68%, transparent);
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
		aspect-ratio: 1;
		background: oklch(from var(--svedit-brand, oklch(60% 0.22 283)) 0.985 0.012 h);
		box-shadow: none;
	}

	.create-illustration {
		background: oklch(from var(--svedit-brand, oklch(60% 0.22 283)) 0.985 0.012 h);
		border: 1px dashed oklch(from var(--svedit-brand, oklch(60% 0.22 283)) 0.8 0.08 h / 0.45);
		box-shadow: none;
	}

	.tree-illustration {
		width: 2.15rem;
		aspect-ratio: 1;
		flex: 0 0 auto;
		margin: 0.2rem 0.2rem 0.2rem 0;
		border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent);
		background: color-mix(in oklch, var(--foreground) 2%, var(--background));
	}

	.media-preview {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		background: color-mix(in oklch, var(--foreground) 3%, var(--background));
	}

	.page-illustration-fallback {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		background: color-mix(in oklch, var(--foreground) 2%, var(--background));
	}

	.page-symbol {
		width: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.12rem;
	}

	.page-symbol-line {
		height: 1px;
		background: color-mix(in oklch, var(--foreground) 24%, transparent);
	}

	.page-symbol-line-short {
		width: 62%;
	}

	.plus-glyph {
		font-size: 2rem;
		line-height: 1;
		font-weight: 300;
		color: var(--svedit-brand, oklch(60% 0.22 283));
	}

	.draft-title {
		font-size: 0.72rem;
		font-weight: 500;
		line-height: 1.18;
		color: inherit;
		text-align: center;
	}

	.match-highlight {
		background: color-mix(in oklch, var(--svedit-editing-fill) 88%, transparent);
		color: inherit;
	}

	.tree {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.tree-node {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.tree-row-shell {
		display: flex;
		align-items: stretch;
		min-width: 0;
	}

	.tree-guides {
		flex: 0 0 auto;
		display: flex;
		align-items: stretch;
		align-self: stretch;
		min-width: max-content;
		margin-right: 0.2rem;
	}

	.tree-guide-column,
	.tree-gutter {
		position: relative;
		width: 1rem;
		flex: 0 0 1rem;
		align-self: stretch;
	}

	.tree-guide-rail,
	.tree-gutter-rail {
		position: absolute;
		left: calc(50% - 0.5px);
		width: 1px;
		background: color-mix(in oklch, var(--foreground) 22%, transparent);
	}

	.tree-guide-rail {
		top: 0;
		bottom: 0;
	}

	.tree-gutter {
		padding: 0;
		border: 0;
		background: transparent;
		cursor: default;
		pointer-events: none;
		overflow: visible;
		min-height: 100%;
	}

	.tree-gutter-rail-top {
		top: 0;
		height: 50%;
	}

	.tree-gutter-rail-bottom {
		top: 50%;
		height: 50%;
	}

	.tree-gutter-elbow {
		position: absolute;
		left: calc(50% - 0.5px);
		top: 50%;
		width: 0.72rem;
		height: 1px;
		background: color-mix(in oklch, var(--foreground) 22%, transparent);
	}

	.tree-leaf-dot {
		position: absolute;
		left: calc(50% - 0.11rem);
		top: calc(50% - 0.11rem);
		width: 0.22rem;
		height: 0.22rem;
		background: color-mix(in oklch, var(--foreground) 28%, transparent);
	}

	.tree-label {
		min-width: 0;
		flex: 1 1 auto;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0;
		font-size: 0.9rem;
		font-weight: 600;
		line-height: 1.15;
		color: inherit;
		padding-left: 0.75rem;
	}

	.tree-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.page-slug-label {
		font-family: ui-monospace, 'SFMono-Regular', 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
		font-size: 0.68rem;
		font-weight: 500;
		line-height: 1.1;
		letter-spacing: 0.01em;
		color: color-mix(in oklch, currentColor 52%, transparent);
	}

	.page-slug-label-right {
		display: block;
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: right;
	}

	.tree-actions-dots {
		display: inline-block;
		transform: translateY(-0.02rem);
	}

	.tree-children {
		display: flex;
		flex-direction: column;
		gap: 0;
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

	.page-actions-dialog::backdrop {
		background: transparent;
	}

	.confirm-dialog::backdrop {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
	}

	.menu-panel {
		position: fixed;
		z-index: 40;
		display: flex;
		flex-direction: column;
		min-width: 12rem;
		margin: 0;
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

		.draft-title {
			font-size: 0.68rem;
		}

		.search-input {
			font-size: 0.84rem;
			padding: 0.5rem 0.65rem;
		}
	}
</style>
