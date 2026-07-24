<script lang="ts">
	import { get_app_context } from '../app_context.js';
	import { resolve } from '$app/paths';
	import { get_page_browser } from './page_browser_context.svelte.js';
	import { get_selection_node_ancestors } from '../app_utils.js';
	import NodeNavigator from './NodeNavigator.svelte';

	let { session, app_commands, editable, focus_canvas } = $props();

	const page_browser = get_page_browser();
	const app = get_app_context();

	let cancel_command = $derived(app_commands.cancel_editing ?? null);
	let cancel_button_label = $derived(cancel_command?.label || 'Cancel');
	let can_browse_pages = $derived(app.has_backend && app.is_admin && !editable);
	let can_create_pages = $derived(app.has_backend && app.is_admin);
	let can_logout = $derived(app.has_backend && app.is_admin && !editable);
	let can_edit_document = $derived(
		(!app.has_backend || app.is_admin) && !app_commands.edit_document.disabled
	);
	let can_show_read_toolbar = $derived(
		can_create_pages || can_browse_pages || can_edit_document || can_logout
	);

	let selected_property = $derived(
		session.selection?.type === 'property' ? session.get(session.selection.path) : null
	);
	let is_media_selected = $derived(
		selected_property?.type === 'image' || selected_property?.type === 'video'
	);
	let is_node_caret = $derived(
		session.selection?.type === 'node' &&
			session.selection.anchor_offset === session.selection.focus_offset
	);

	let can_select_parent = $derived(
		!!session.commands.select_parent && !session.commands.select_parent.disabled
	);
	let can_show_variant_selector = $derived(get_selection_node_ancestors(session).length > 0);
	let can_show_selection_tool_group = $derived(can_select_parent || can_show_variant_selector);

	let file_input_ref = $state(null);

	function handle_insert_default_node_click(e) {
		handle_btn_mousedown(e, session.commands.insert_default_node);
	}

	function handle_delete_selection_click(event) {
		event.preventDefault();
		session.apply(session.tr.delete_selection('backward'));
	}

	function cache_replace_media_path(path) {
		document.documentElement.dataset.replaceMediaPath = JSON.stringify(path);
	}

	function handle_edit_image_click(e) {
		e.preventDefault();
		if (session.commands.edit_image?.disabled) return;
		session.commands.edit_image?.execute();
	}

	function handle_replace_image_click(e) {
		e.preventDefault();
		if (session.selection?.type !== 'property') return;
		cache_replace_media_path(session.selection.path);
		file_input_ref?.click();
	}

	async function handle_file_selected(e) {
		const file = e.target.files?.[0];
		const cached_path = document.documentElement.dataset.replaceMediaPath;
		const path = cached_path ? JSON.parse(cached_path) : null;
		if (!file || !path) return;

		// HACK: Android produces broken blob urls on the original file object,
		// turning it into a blob first, fixes this. On the downside, this will use
		// up more memory temporarily.
		const normalized_blob = new Blob([await file.arrayBuffer()], { type: file.type });
		const blob_url = URL.createObjectURL(normalized_blob);

		await session.config.replace_media(session, path, normalized_blob, blob_url);
		delete document.documentElement.dataset.replaceMediaPath;
		// Reset so the same file can be re-selected
		e.target.value = '';
	}

	const TW_TOOLBAR_POSITION =
		'bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-5 right-5 sm:left-7 sm:right-7 md:left-10 md:right-10 lg:left-14 lg:right-14';
	const TW_TOOLBAR_SURFACE =
		'pointer-events-auto min-w-0 rounded-full border border-(--border) bg-(--background) p-1 text-(--foreground) shadow-[0_1px_2px_rgb(0_0_0/0.12),0_4px_16px_rgb(0_0_0/0.08)]';

	const TW_TOOLBAR_BTN =
		'flex size-9 flex-none items-center justify-center rounded-full border-0 bg-transparent p-0 text-(--foreground) shadow-none cursor-pointer pointer-events-auto transition-all duration-150 active:scale-95 active:translate-y-px outline-1 outline-transparent focus-visible:outline-1 focus-visible:outline-(--svedit-editing-stroke) focus-visible:outline-offset-1';
	const TW_TOOLBAR_BTN_DISABLED = 'text-(--muted-foreground) opacity-40 !cursor-not-allowed';
	const TW_TOOLBAR_BTN_HOVER =
		'hover:bg-(--muted) active:bg-(--muted) active:scale-95 active:translate-y-px';

	function handle_btn_mousedown(event, command) {
		event.preventDefault();
		if (command?.disabled) return;
		command.execute();
	}
</script>

{#snippet selection_leading_contents()}
	<button
		class="{TW_TOOLBAR_BTN} {session.commands.select_parent?.disabled
			? TW_TOOLBAR_BTN_DISABLED
			: TW_TOOLBAR_BTN_HOVER}"
		onmousedown={(e) => handle_btn_mousedown(e, session.commands.select_parent)}
		title="Select parent (Esc)"
		aria-label="Select parent"
	>
		<svg
			class="size-6"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M6.5 12.5C6.5 15.8137 9.18629 18.5 12.5 18.5C15.8137 18.5 18.5 15.8137 18.5 12.5C18.5 9.18629 15.8137 6.5 12.5 6.5"
				stroke="currentColor"
				stroke-linecap="round"
			/>
			<path
				d="M4.48278 4.48206L13 12.9993M9.44657 4.48173L4.48278 4.48206V9.44727"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>
	{#if can_show_variant_selector}
		<span class="selection-leading-divider mx-1 h-5 w-px shrink-0 bg-(--border)" aria-hidden="true"
		></span>
	{/if}
{/snippet}

{#snippet save_group_contents()}
	<span class="mx-1 h-5 w-px shrink-0 bg-(--border)" aria-hidden="true"></span>
	{#if cancel_command && !cancel_command.disabled}
		<button
			class="pointer-events-auto inline-flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-sm font-medium text-(--foreground) shadow-none outline-1 outline-transparent transition-all duration-150 hover:bg-(--muted) focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke) active:translate-y-px active:scale-[0.97] active:bg-(--muted) sm:w-auto sm:px-4"
			onclick={() => cancel_command.execute()}
			title="Cancel (⌘ ⎋)"
			aria-label={cancel_button_label}
		>
			<svg class="size-6 sm:hidden" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<circle cx="12" cy="12" r="9.5" stroke="currentColor" />
				<path
					d="M5.25 18.75L18.75 5.25"
					stroke="currentColor"
					stroke-linecap="round"
				/>
			</svg>
			<span class="hidden sm:inline">{cancel_button_label}</span>
		</button>
	{/if}

	{#if !app_commands.save_document.disabled}
		<button
			class="pointer-events-auto inline-flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-sm font-semibold text-(--svedit-editing-stroke) shadow-none outline-1 outline-transparent transition-all duration-150 hover:bg-(--svedit-editing-fill) focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-(--svedit-editing-stroke) active:translate-y-px active:scale-[0.97] active:bg-(--svedit-editing-fill) sm:w-auto sm:px-4"
			onclick={() => app_commands.save_document.execute()}
			title="Save (⌘ S)"
			aria-label="Save"
		>
			<svg class="size-6 sm:hidden" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M4 3.5H16.5L20 7V20.5H4V3.5Z" stroke="currentColor" />
				<path d="M7.5 3.5V9.5H16.5V3.5M7.5 20.5V13.5H16.5V20.5" stroke="currentColor" />
			</svg>
			<span class="hidden sm:inline">Save</span>
		</button>
	{/if}
{/snippet}

{#if editable || can_show_read_toolbar}
	<div
		class="toolbar-layout pointer-events-none fixed {TW_TOOLBAR_POSITION} z-50 flex min-w-0 items-center gap-3"
	>
		{#if editable && can_select_parent}
			<div class="mobile-selection-leading shrink-0 items-center">
				{@render selection_leading_contents()}
			</div>
		{/if}

		<div class="toolbar-middle min-w-0">
			{#if editable && can_show_selection_tool_group}
				<div class="editor-toolbar selection-toolbar flex shrink items-center {TW_TOOLBAR_SURFACE}">
					{#if can_select_parent}
						<div class="desktop-selection-leading flex shrink-0 items-center">
							{@render selection_leading_contents()}
						</div>
					{/if}
					<div
						class="selection-scroller min-w-0 [scrollbar-width:none] overflow-x-auto rounded-full"
					>
						<NodeNavigator {session} {focus_canvas} />
					</div>
				</div>
			{/if}

			<div class="toolbar-spacer min-w-0 flex-1"></div>

			<div class="editor-toolbar action-toolbar flex shrink items-center {TW_TOOLBAR_SURFACE}">
				<div
					class="tools-scroller min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto rounded-full"
				>
					<div class="flex min-w-max items-center gap-0">
						{#if !editable}
							<!-- Read mode: New page + Edit + Pages buttons -->
							<div class="flex items-center">
								{#if can_create_pages}
									<a
										class="{TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
										href={resolve('/new')}
										title="New page"
										aria-label="New page"
									>
										<svg
											class="size-4"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 15 15"
											fill="none"
											aria-hidden="true"
										>
											<path d="M7.5 3V12M3 7.5H12" stroke="currentColor" stroke-linecap="square" />
										</svg>
									</a>
								{/if}

								{#if can_browse_pages}
									<button
										class="{TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
										onclick={() => page_browser?.open_navigate()}
										title="Browse (⌘ P)"
										aria-label="Browse"
									>
										<svg
											class="size-6"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											aria-hidden="true"
										>
											<rect x="4.5" y="4.5" width="6" height="6" rx="1" stroke="currentColor" />
											<rect x="13.5" y="4.5" width="6" height="6" rx="1" stroke="currentColor" />
											<rect x="4.5" y="13.5" width="6" height="6" rx="1" stroke="currentColor" />
											<rect x="13.5" y="13.5" width="6" height="6" rx="1" stroke="currentColor" />
										</svg>
									</button>
								{/if}

								{#if can_edit_document}
									<button
										class="{TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
										onclick={() => app_commands.edit_document.execute()}
										title="Edit (⌘ E)"
										aria-label="Edit"
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
								{/if}

								{#if can_logout}
									<button
										class="page-actions-trigger {TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
										popovertarget="toolbar-page-actions-menu"
										title="Page actions"
										aria-label="Page actions"
									>
										<svg
											class="size-6"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
										>
											<circle cx="6" cy="12" r="1" />
											<circle cx="12" cy="12" r="1" />
											<circle cx="18" cy="12" r="1" />
										</svg>
									</button>
									<div
										id="toolbar-page-actions-menu"
										class="page-actions-menu min-w-44 rounded-2xl border border-(--border) bg-(--background) p-1.5 text-(--foreground) shadow-[0_1px_2px_rgb(0_0_0/0.12),0_4px_16px_rgb(0_0_0/0.08)]"
										popover="auto"
										role="menu"
										aria-label="Page actions"
									>
										<button
											type="button"
											class="page-actions-item"
											popovertarget="toolbar-page-actions-menu"
											popovertargetaction="hide"
											role="menuitem">Duplicate page</button
										>
										<button
											type="button"
											class="page-actions-item"
											popovertarget="toolbar-page-actions-menu"
											popovertargetaction="hide"
											role="menuitem">Edit URL</button
										>
										<button
											type="button"
											class="page-actions-item"
											popovertarget="toolbar-page-actions-menu"
											popovertargetaction="hide"
											role="menuitem">Delete page</button
										>
										<div class="my-1 h-px bg-(--border)" role="separator"></div>
										<button
											type="button"
											class="page-actions-item"
											popovertarget="toolbar-page-actions-menu"
											popovertargetaction="hide"
											onclick={() => app_commands.logout_admin.execute()}
											role="menuitem">Logout</button
										>
									</div>
								{/if}
							</div>
						{:else}
							<!-- Edit mode -->
							<!-- Text formatting group (visible during text selection) -->
							{#if session.selection?.type === 'text'}
								<div class="flex items-center">
									<!-- Bold -->
									<button
										class="{TW_TOOLBAR_BTN} {session.commands.toggle_strong?.disabled
											? TW_TOOLBAR_BTN_DISABLED
											: TW_TOOLBAR_BTN_HOVER}"
										class:!text-(--svedit-editing-stroke)={session.commands.toggle_strong?.active}
										class:!bg-(--svedit-editing-fill)={session.commands.toggle_strong?.active}
										onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_strong)}
										title="Bold (⌘ B)"
									>
										<svg
											class="size-6"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M8 11.7667V19H13.0167C15.0141 19 16.6333 17.3808 16.6333 15.3833C16.6333 13.3859 15.0141 11.7667 13.0167 11.7667H8ZM8 11.7667V5H12.55C14.4186 5 15.9333 6.51477 15.9333 8.38333C15.9333 10.2519 14.4186 11.7667 12.55 11.7667H8Z"
												stroke="currentColor"
												stroke-width="2"
												stroke-linejoin="round"
											/>
										</svg>
									</button>

									<!-- Italic -->
									<button
										class="{TW_TOOLBAR_BTN} {session.commands.toggle_emphasis?.disabled
											? TW_TOOLBAR_BTN_DISABLED
											: TW_TOOLBAR_BTN_HOVER}"
										class:!text-(--svedit-editing-stroke)={session.commands.toggle_emphasis?.active}
										class:!bg-(--svedit-editing-fill)={session.commands.toggle_emphasis?.active}
										onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_emphasis)}
										title="Italic (⌘ I)"
									>
										<svg
											class="size-6"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M10 19.5L14 4.5M10 19.5H5.5M10 19.5H14.5M14 4.5H18.5M14 4.5H9.5"
												stroke="currentColor"
												stroke-linecap="round"
											/>
										</svg>
									</button>

									<!-- Code -->
									<button
										class="{TW_TOOLBAR_BTN} {session.commands.toggle_code?.disabled
											? TW_TOOLBAR_BTN_DISABLED
											: TW_TOOLBAR_BTN_HOVER}"
										class:!text-(--svedit-editing-stroke)={session.commands.toggle_code?.active}
										class:!bg-(--svedit-editing-fill)={session.commands.toggle_code?.active}
										onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_code)}
										title="Code (⌘ ⇧ C)"
										aria-label="Code"
									>
										<svg
											class="size-6"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden="true"
										>
											<path
												d="M15.422 6.85559L20.5664 12L15.422 17.1444"
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
											<path
												d="M8.5741 6.85559L3.42969 12L8.5741 17.1444"
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</button>

									<!-- Highlight -->
									<button
										class="{TW_TOOLBAR_BTN} {session.commands.toggle_highlight?.disabled
											? TW_TOOLBAR_BTN_DISABLED
											: TW_TOOLBAR_BTN_HOVER}"
										class:!text-(--svedit-editing-stroke)={session.commands.toggle_highlight
											?.active}
										class:!bg-(--svedit-editing-fill)={session.commands.toggle_highlight?.active}
										onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_highlight)}
										title="Highlight (⌘ U)"
									>
										<svg
											class="size-6"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M12.2213 2.36648C12.7152 1.37848 13.9165 0.977924 14.9045 1.47182C15.8925 1.96571 16.2931 3.16702 15.7992 4.15502L7.58735 20.5823L4.80832 22.669C4.47866 22.9166 4.00792 22.6813 4.00808 22.269L4.00948 18.7937L12.2213 2.36648Z"
												fill="currentColor"
											/>
											<path
												d="M19.9298 19.4968C19.9298 19.4968 15.5167 17.2024 15.5167 13.0671C15.5167 8.29339 21.4879 5.77291 21.4879 11.0664C21.4879 17.704 14.4662 20.1661 10.5039 19.4968"
												stroke="currentColor"
												stroke-linecap="round"
											/>
										</svg>
									</button>

									<!-- Link -->
									<button
										class="{TW_TOOLBAR_BTN} {session.commands.toggle_link?.disabled
											? TW_TOOLBAR_BTN_DISABLED
											: TW_TOOLBAR_BTN_HOVER}"
										class:!text-(--svedit-editing-stroke)={session.commands.toggle_link?.active}
										class:!bg-(--svedit-editing-fill)={session.commands.toggle_link?.active}
										onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_link)}
										title="Link (⌘ K)"
									>
										<svg
											class="size-6"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M14.6668 11.5189C14.4506 11.0529 14.1503 10.6163 13.7659 10.2319C12.0086 8.47455 9.23819 8.5329 7.40199 10.2319C6.66799 10.9111 5.95984 11.6192 5.28067 12.3532C3.58406 14.1867 3.52331 16.9598 5.28067 18.7172C7.03802 20.4745 9.81111 20.4138 11.6446 18.7172C12.0107 18.3785 12.3703 18.0326 12.7231 17.6798"
												stroke="currentColor"
												stroke-linecap="round"
											/>
											<path
												d="M9.32925 12.4811C9.54548 12.9471 9.84578 13.3837 10.2301 13.7681C11.9875 15.5255 14.7579 15.4671 16.5941 13.7681C17.3281 13.0889 18.0363 12.3808 18.7154 11.6468C20.412 9.81325 20.4728 7.04017 18.7154 5.28281C16.9581 3.52545 14.185 3.58621 12.3515 5.28281C11.9854 5.62151 11.6258 5.96742 11.273 6.32015"
												stroke="currentColor"
												stroke-linecap="round"
											/>
										</svg>
									</button>
								</div>
							{/if}

							<!-- Media actions (visible when media is selected) -->
							{#if is_media_selected}
								<div class="flex items-center">
									<button
										class="{TW_TOOLBAR_BTN} {session.commands.edit_image?.disabled
											? TW_TOOLBAR_BTN_DISABLED
											: TW_TOOLBAR_BTN_HOVER}"
										onmousedown={handle_edit_image_click}
										title="Alt text"
										aria-label="Alt text"
									>
										<span
											class="inline-flex h-4 min-w-5 items-center justify-center rounded-[3px] border border-current px-0.5 text-[8px] leading-none font-medium tracking-[0.04em]"
											aria-hidden="true">ALT</span
										>
									</button>

									<button
										id="replace-media-btn"
										class="{TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
										onmousedown={handle_replace_image_click}
										title="Replace image (⏎)"
										aria-label="Replace image"
									>
										<svg
											class="size-6"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden="true"
										>
											<path
												d="M4.5 17.5L9 13L12 16L14.5 13.5L19.5 18.5M5.5 4.5H18.5C19.0523 4.5 19.5 4.94772 19.5 5.5V18.5C19.5 19.0523 19.0523 19.5 18.5 19.5H5.5C4.94772 19.5 4.5 19.0523 4.5 18.5V5.5C4.5 4.94772 4.94772 4.5 5.5 4.5Z"
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
											<circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" />
										</svg>
									</button>
								</div>
							{/if}

							{#if session.selection?.type === 'node' || is_media_selected}
								<div class="flex items-center">
									{#if is_node_caret && !session.commands.insert_default_node?.disabled}
										<button
											class="{TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
											onmousedown={handle_insert_default_node_click}
											title="Insert (↵)"
											aria-label="Insert"
										>
											<svg
												class="size-4"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 15 15"
												fill="none"
												aria-hidden="true"
											>
												<path
													d="M7.5 3V12M3 7.5H12"
													stroke="currentColor"
													stroke-linecap="square"
												/>
											</svg>
										</button>
									{/if}
									{#if session.selection?.type === 'node' && !is_node_caret && !session.commands.toggle_section?.disabled}
										<button
											class="{TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
											class:!text-(--svedit-editing-stroke)={session.commands.toggle_section
												?.active}
											class:!bg-(--svedit-editing-fill)={session.commands.toggle_section?.active}
											onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_section)}
											title="Toggle section (⌘ ⇧ S)"
											aria-label="Toggle section"
										>
											<svg
												class="size-6"
												viewBox="0 0 24 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
												aria-hidden="true"
											>
												<path
													d="M15.9706 4.5L17.5 4.5C18.6046 4.5 19.5 5.39543 19.5 6.5L19.5 17.5C19.5 18.6046 18.6046 19.5 17.5 19.5L15.9706 19.5"
													stroke="currentColor"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
												<path
													d="M8.02941 4.5L6.5 4.5C5.39543 4.5 4.5 5.39543 4.5 6.5L4.5 17.5C4.5 18.6046 5.39543 19.5 6.5 19.5L8.02941 19.5"
													stroke="currentColor"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</svg>
										</button>
									{/if}
									<button
										class="{TW_TOOLBAR_BTN} aspect-square {TW_TOOLBAR_BTN_HOVER}"
										onmousedown={handle_delete_selection_click}
										title="Delete backwards (⌫)"
										aria-label="Delete backwards"
									>
										<svg
											class="size-6"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											aria-hidden="true"
										>
											<path
												d="M6.89951 5.25063C7.27906 4.77619 7.85369 4.5 8.46126 4.5H17.5C18.6046 4.5 19.5 5.39543 19.5 6.5V17.5003C19.5 18.6049 18.6046 19.5003 17.5 19.5003H8.46126C7.85369 19.5003 7.27906 19.2242 6.89951 18.7497L2.49948 13.2495C1.91514 12.5191 1.91514 11.4812 2.49948 10.7508L6.89951 5.25063Z"
												stroke="currentColor"
												stroke-linecap="round"
											/>
											<path
												d="M14.9528 14.4762L12.4764 11.9998L10 9.52344M14.9528 9.52344L10 14.4762"
												stroke="currentColor"
												stroke-linecap="round"
											/>
										</svg>
									</button>
								</div>
							{/if}

							<!-- Hidden file input for replace-image -->
							<input
								id="replace-media-input"
								bind:this={file_input_ref}
								type="file"
								accept="image/*,video/*"
								class="hidden"
								onchange={handle_file_selected}
							/>

							<!-- Stable right group: Undo / Redo -->
							<div class="flex items-center">
								<button
									class="{TW_TOOLBAR_BTN} {session.commands.undo?.disabled
										? TW_TOOLBAR_BTN_DISABLED
										: TW_TOOLBAR_BTN_HOVER}"
									onmousedown={(e) => handle_btn_mousedown(e, session.commands.undo)}
									title="Undo (⌘ Z)"
								>
									<svg
										class="size-6"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M2.5 7.4994L16.0672 7.49941C19.1045 7.49941 21.5667 9.96163 21.5667 12.9989C21.5667 16.0362 19.1045 18.4984 16.0672 18.4984H11.5M7.5 2.5L2.5 7.4994L7.5 12.4988"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</button>
								<button
									class="{TW_TOOLBAR_BTN} {session.commands.redo?.disabled
										? TW_TOOLBAR_BTN_DISABLED
										: TW_TOOLBAR_BTN_HOVER}"
									onmousedown={(e) => handle_btn_mousedown(e, session.commands.redo)}
									title="Redo (⌘ ⇧ Z)"
								>
									<svg
										class="size-6"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M21.5664 7.4994L7.99925 7.49941C4.96195 7.49941 2.49973 9.96163 2.49973 12.9989C2.49973 16.0362 4.96195 18.4984 7.99925 18.4984H12.4988M16.5664 2.5L21.5664 7.4994L16.5664 12.4988"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</button>
							</div>
						{/if}
					</div>
				</div>

				{#if editable}
					<div class="desktop-save-group flex shrink-0 items-center">
						{@render save_group_contents()}
					</div>
				{/if}
			</div>
		</div>

		{#if editable}
			<div class="mobile-save-group shrink-0 items-center">
				{@render save_group_contents()}
			</div>
		{/if}
	</div>
{/if}

<style>
	/* NodeNavigator owns its standalone surface in other contexts. Inside the
	   toolbar it becomes one flat item in the shared pill. */
	:global(.editor-toolbar [aria-label='Current node variant']) {
		border-color: transparent;
		background: transparent;
		box-shadow: none;
	}

	/* The toolbar no longer calls attention to tools with looping motion. */
	:global(.editor-toolbar [aria-label='Current node variant']::after) {
		content: none;
		display: none;
	}

	.page-actions-trigger {
		anchor-name: --toolbar-page-actions;
	}

	.page-actions-menu {
		position: fixed;
		position-anchor: --toolbar-page-actions;
		position-area: block-start span-inline-end;
		justify-self: anchor-center;
		inset: auto;
		margin: 0 12px 8px;
	}

	.page-actions-item {
		display: block;
		width: 100%;
		cursor: pointer;
		border: 0;
		border-radius: 0.75rem;
		background: transparent;
		padding: 0.625rem 0.75rem;
		color: var(--foreground);
		font-size: 0.875rem;
		line-height: 1.25rem;
		text-align: left;
	}

	.page-actions-item:hover,
	.page-actions-item:focus-visible {
		background: var(--muted);
		outline: none;
	}

	.selection-leading-divider {
		display: block;
		align-self: center;
	}

	.mobile-selection-leading,
	.mobile-save-group {
		display: none;
	}

	.toolbar-middle {
		display: contents;
	}

	@media (max-width: 639px) {
		.toolbar-layout {
			right: auto;
			left: 50%;
			width: max-content;
			max-width: calc(100vw - 2.5rem);
			transform: translateX(-50%);
			overflow: hidden;
			gap: 0;
			padding: 4px 0;
			color: var(--foreground);
			background: var(--background);
			border: 1px solid var(--border);
			border-radius: 9999px;
			box-shadow:
				0 1px 2px rgb(0 0 0 / 0.12),
				0 4px 16px rgb(0 0 0 / 0.08);
			pointer-events: auto;
		}

		.desktop-selection-leading,
		.desktop-save-group {
			display: none;
		}

		.toolbar-middle {
			display: flex;
			flex: 0 1 auto;
			min-width: 0;
			overflow-x: auto;
			overscroll-behavior-x: contain;
			scrollbar-width: none;
		}

		.toolbar-middle > .editor-toolbar {
			display: contents;
			padding: 0;
			background: transparent;
			border: 0;
			border-radius: 0;
			box-shadow: none;
			backdrop-filter: none;
		}

		.toolbar-spacer {
			display: none;
		}

		.selection-scroller,
		.tools-scroller {
			display: contents;
		}

		.mobile-selection-leading {
			display: flex;
			flex: none;
			align-self: stretch;
			padding-left: 4px;
			background: var(--background);
		}

		.mobile-save-group {
			display: flex;
			flex: none;
			align-self: stretch;
			padding-right: 4px;
			background: var(--background);
		}
	}
</style>
