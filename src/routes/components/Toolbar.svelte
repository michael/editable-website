<script>
	let { session, app_commands, editable, focus_canvas } = $props();

	let cancel_command = $derived(app_commands.cancel_editing ?? null);
	let cancel_button_label = $derived(cancel_command?.label || 'Cancel');

	let selected_property = $derived(
		session.selection?.type === 'property'
			? session.get(session.selection.path)
			: null
	);
	let is_media_selected = $derived(
		selected_property?.type === 'image' || selected_property?.type === 'video'
	);

	let file_input_ref = $state(null);

	function cache_replace_media_path(path) {
		document.documentElement.dataset.replaceMediaPath = JSON.stringify(path);
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

	const TW_TOOLBAR_POSITION = 'bottom-5 right-5 sm:right-7 md:right-10 lg:right-14';
	// On mobile also pin to left edge so the toolbar can scroll horizontally
	const TW_TOOLBAR_LEFT = 'left-5 sm:left-7 md:left-auto';

	const TW_TOOLBAR_BTN = 'flex items-center justify-center size-9 rounded-full text-(--foreground) bg-(--background) border border-[color:color-mix(in_oklch,var(--foreground)_18%,transparent)] cursor-pointer pointer-events-auto shadow-md transition-all duration-150 active:scale-95 active:translate-y-px';
	const TW_TOOLBAR_BTN_DISABLED = 'text-[oklch(from_var(--foreground)_0.8_0_0)] !cursor-not-allowed';
	const TW_TOOLBAR_BTN_HOVER = 'hover:bg-[color:color-mix(in_oklch,var(--foreground)_10%,var(--background))] hover:border-[color:color-mix(in_oklch,var(--foreground)_28%,transparent)] active:bg-[color:color-mix(in_oklch,var(--foreground)_16%,var(--background))] active:border-[color:color-mix(in_oklch,var(--foreground)_36%,transparent)] active:scale-95 active:translate-y-px';

	function handle_btn_mousedown(event, command) {
		event.preventDefault();
		if (command?.disabled) return;
		command.execute();
	}
</script>

<div class="fixed {TW_TOOLBAR_POSITION} {TW_TOOLBAR_LEFT} z-50 select-none pointer-events-none">
	<div class="overflow-x-auto -mb-3 pb-3 -ml-3 pl-3">
		<div class="flex items-center gap-1.5 sm:gap-3 w-max ml-auto pointer-events-none">
			{#if !editable}
				<!-- Read mode: Edit button -->
				{#if !app_commands.edit_document.disabled}
					<button
						class="px-4 py-2 text-sm font-semibold cursor-pointer pointer-events-auto rounded-full text-(--background) bg-(--svedit-brand) shadow-md transition-colors duration-150 hover:brightness-90"
						onclick={() => app_commands.edit_document.execute()}
						title="Edit (⌘E)"
					>
						Edit
					</button>
				{/if}
			{:else}
				<!-- Edit mode -->

				<!-- Text formatting group (visible during text selection) -->
				{#if session.selection?.type === 'text'}
					<div class="flex items-center gap-1 pointer-events-none">
						<!-- Bold -->
						<button
							class="{TW_TOOLBAR_BTN} {session.commands.toggle_strong?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
							class:!text-(--svedit-editing-stroke)={session.commands.toggle_strong?.active}
							class:!border-(--svedit-editing-stroke)={session.commands.toggle_strong?.active}
							onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_strong)}
							title="Bold (⌘B)"
						>
							<svg class="size-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M3.7124 13V1.13403H7.8774C10.1894 1.13403 11.4814 2.35803 11.4814 4.29603C11.4814 5.63903 10.7844 6.43803 9.5434 6.79503V6.89703C11.0054 7.25403 11.8554 8.13803 11.8554 9.73603C11.8554 11.725 10.5124 13 8.2684 13H3.7124ZM6.1944 11.215H7.4864C8.6934 11.215 9.2544 10.875 9.2544 9.78703V9.29403C9.2544 8.22303 8.6934 7.86603 7.4864 7.86603H6.1944V11.215ZM6.1944 6.16603H7.1634C8.3534 6.16603 8.8804 5.82603 8.8804 4.78903V4.27903C8.8804 3.24203 8.3534 2.91903 7.1634 2.91903H6.1944V6.16603Z" fill="currentColor"></path>
							</svg>
						</button>

						<!-- Italic -->
						<button
							class="{TW_TOOLBAR_BTN} {session.commands.toggle_emphasis?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
							class:!text-(--svedit-editing-stroke)={session.commands.toggle_emphasis?.active}
							class:!border-(--svedit-editing-stroke)={session.commands.toggle_emphasis?.active}
							onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_emphasis)}
							title="Italic (⌘I)"
						>
							<svg class="size-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10.4783 13H3.08325L3.28725 11.742H6.17725L7.74125 2.39203H4.85125L5.05525 1.13403H12.4503L12.2463 2.39203H9.35625L7.79225 11.742H10.6823L10.4783 13Z" fill="currentColor"></path>
							</svg>
						</button>

						<!-- Highlight -->
						<button
							class="{TW_TOOLBAR_BTN} {session.commands.toggle_highlight?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
							class:!text-(--svedit-editing-stroke)={session.commands.toggle_highlight?.active}
							class:!border-(--svedit-editing-stroke)={session.commands.toggle_highlight?.active}
							onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_highlight)}
							title="Highlight (⌘U)"
						>
							<svg class="size-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M0 13H4.63L4.5 8H0V13Z" fill="currentColor"></path>
								<path d="M14.1465 5.14652C14.3418 4.95126 14.6584 4.95126 14.8536 5.14652C15.0489 5.34179 15.0489 5.65837 14.8536 5.85363L14.5001 5.50008L14.1465 5.14652ZM12.0001 8.00008L12.3536 8.35363C12.1584 8.54889 11.8418 8.54889 11.6465 8.35363L12.0001 8.00008ZM7.00008 3.00008L6.64652 3.35363C6.55276 3.25986 6.50008 3.13269 6.50008 3.00008C6.50008 2.86747 6.55276 2.74029 6.64652 2.64652L7.00008 3.00008ZM9.14652 0.146525C9.34179 -0.0487373 9.65837 -0.0487373 9.85363 0.146525C10.0489 0.341787 10.0489 0.658369 9.85363 0.853632L9.50008 0.500078L9.14652 0.146525ZM6.00008 5.00008L5.64652 5.35363C5.55276 5.25986 5.50008 5.13269 5.50008 5.00008C5.50008 4.86747 5.55276 4.74029 5.64652 4.64652L6.00008 5.00008ZM10.0001 9.00008L10.3536 9.35363C10.1584 9.54889 9.84179 9.54889 9.64652 9.35363L10.0001 9.00008ZM9.00008 8.00008L9.35363 7.64652L9.35363 7.64652L9.00008 8.00008ZM5 11.9302L5.35042 12.2868L4.62152 13.003L4.50335 11.988L5 11.9302ZM4.56226 8.17L4.06561 8.22782L4.03894 7.99871L4.19591 7.82972L4.56226 8.17ZM6.78117 5.78117L7.13472 5.42761L7.13472 5.42761L6.78117 5.78117ZM14.5001 5.50008L14.8536 5.85363L12.3536 8.35363L12.0001 8.00008L11.6465 7.64652L14.1465 5.14652L14.5001 5.50008ZM7.00008 3.00008L6.64652 2.64652L9.14652 0.146525L9.50008 0.500078L9.85363 0.853632L7.35363 3.35363L7.00008 3.00008ZM7.50008 3.50008L7.14652 3.85363L6.64652 3.35363L7.00008 3.00008L7.35363 2.64652L7.85363 3.14652L7.50008 3.50008ZM7.50008 3.50008L7.85363 3.85363L6.35363 5.35363L6.00008 5.00008L5.64652 4.64652L7.14652 3.14652L7.50008 3.50008ZM12.0001 8.00008L11.6465 8.35363L11.1465 7.85363L11.5001 7.50008L11.8536 7.14652L12.3536 7.64652L12.0001 8.00008ZM11.5001 7.50008L11.1465 7.85363L7.14652 3.85363L7.50008 3.50008L7.85363 3.14652L11.8536 7.14652L11.5001 7.50008ZM10.0001 9.00008L9.64652 8.64652L11.1465 7.14652L11.5001 7.50008L11.8536 7.85363L10.3536 9.35363L10.0001 9.00008ZM9.00008 8.00008L9.35363 7.64652L10.3536 8.64652L10.0001 9.00008L9.64652 9.35363L8.64652 8.35363L9.00008 8.00008ZM9.00008 8.00008L9.3505 8.35674L5.35042 12.2868L5 11.9302L4.64958 11.5735L8.64966 7.64342L9.00008 8.00008ZM5 11.9302L4.50335 11.988L4.06561 8.22782L4.56226 8.17L5.0589 8.11218L5.49665 11.8724L5 11.9302ZM6.00008 5.00008L6.35363 4.64652L7.13472 5.42761L6.78117 5.78117L6.42761 6.13472L5.64652 5.35363L6.00008 5.00008ZM6.78117 5.78117L7.13472 5.42761L9.35363 7.64652L9.00008 8.00008L8.64652 8.35363L6.42761 6.13472L6.78117 5.78117ZM4.56226 8.17L4.19591 7.82972L6.41482 5.44088L6.78117 5.78117L7.14751 6.12145L4.9286 8.51028L4.56226 8.17Z" fill="currentColor"></path>
							</svg>
						</button>

						<!-- Link -->
						<button
							class="{TW_TOOLBAR_BTN} {session.commands.toggle_link?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
							class:!text-(--svedit-editing-stroke)={session.commands.toggle_link?.active}
							class:!border-(--svedit-editing-stroke)={session.commands.toggle_link?.active}
							onmousedown={(e) => handle_btn_mousedown(e, session.commands.toggle_link)}
							title="Link (⌘K)"
						>
							<svg class="size-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M8.88461 8.39935C8.51368 8.76122 8.01477 8.96185 7.49658 8.95753C6.97839 8.95321 6.4829 8.7443 6.11804 8.37629L4.68865 6.9469C4.32285 6.58087 4.11546 6.0858 4.11115 5.56833C4.10684 5.05087 4.30595 4.55241 4.6656 4.18033L7.73649 1.05411C8.1086 0.693964 8.60762 0.49492 9.12545 0.500099C9.64328 0.505277 10.1382 0.71426 10.5031 1.08178L11.9324 2.51117C12.2963 2.87966 12.5003 3.37663 12.5003 3.89445C12.5003 4.41228 12.2963 4.90925 11.9324 5.27774L10.5907 6.61952" stroke="currentColor" stroke-linejoin="round"></path>
								<path d="M6.12702 6.60049C6.49795 6.23862 6.99686 6.03799 7.51505 6.0423C8.03324 6.04662 8.52874 6.25554 8.89359 6.62354L10.323 8.05294C10.6888 8.41897 10.8962 8.91404 10.9005 9.4315C10.9048 9.94897 10.7057 10.4474 10.346 10.8195L7.27515 13.9457C6.90303 14.3059 6.40401 14.5049 5.88618 14.4997C5.36835 14.4946 4.87341 14.2856 4.50858 13.9181L3.07919 12.4887C2.71229 12.1232 2.50414 11.6279 2.49982 11.1101C2.49551 10.5923 2.69538 10.0936 3.05613 9.7221L4.30109 8.47714" stroke="currentColor" stroke-linejoin="round"></path>
							</svg>
						</button>
					</div>
				{/if}

				<!-- Replace image (visible when media is selected) -->
				{#if is_media_selected}
					<button
						id="replace-media-btn"
						class="{TW_TOOLBAR_BTN} {TW_TOOLBAR_BTN_HOVER}"
						onmousedown={handle_replace_image_click}
						title="Replace image (⏎)"
					>
						<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
							<circle cx="8.5" cy="8.5" r="1.5" />
							<polyline points="21 15 16 10 5 21" />
						</svg>
					</button>
				{/if}

				<!-- Type / Layout group (always visible, disabled when not applicable) -->
				<div class="flex items-center gap-1 pointer-events-none">
					<!-- Type: cycle to next node type -->
					<button
						class="{TW_TOOLBAR_BTN} {session.commands.cycle_node_type_next?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
						onmousedown={(e) => handle_btn_mousedown(e, session.commands.cycle_node_type_next)}
						title="Cycle type (⌃⇧↓)"
					>
						<!-- T with small arrows icon -->
						<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="6" y1="4" x2="18" y2="4" />
							<line x1="12" y1="4" x2="12" y2="14" />
							<polyline points="8 18 12 22 16 18" />
							<line x1="12" y1="14" x2="12" y2="22" />
						</svg>
					</button>

					<!-- Layout: cycle to next layout -->
					<button
						class="{TW_TOOLBAR_BTN} {session.commands.cycle_layout_next?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
						onmousedown={(e) => handle_btn_mousedown(e, session.commands.cycle_layout_next)}
						title="Cycle layout (⌃⇧→)"
					>
						<!-- T with right arrow icon -->
						<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="4" y1="6" x2="4" y2="18" />
							<line x1="4" y1="12" x2="14" y2="12" />
							<polyline points="18 8 22 12 18 16" />
							<line x1="14" y1="12" x2="22" y2="12" />
						</svg>
					</button>
				</div>

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
				<div class="flex items-center gap-1 pointer-events-none">
					<button
						class="{TW_TOOLBAR_BTN} {session.commands.undo?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
						onmousedown={(e) => handle_btn_mousedown(e, session.commands.undo)}
						title="Undo (⌘Z)"
					>
						<svg class="size-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M2.13794 12C3.42201 13.5285 5.34758 14.5 7.50005 14.5C11.366 14.5 14.5001 11.366 14.5001 7.5C14.5001 3.63401 11.366 0.5 7.50001 0.5C5.50001 0.5 3.75001 1.75 2.50001 3" stroke="currentColor" stroke-linecap="round"></path>
							<path d="M0 1.20711C0 0.761654 0.538571 0.538571 0.853553 0.853553L4.64645 4.64645C4.96143 4.96143 4.73835 5.5 4.29289 5.5H0.5C0.223857 5.5 0 5.27614 0 5V1.20711Z" fill="currentColor"></path>
						</svg>
					</button>
					<button
						class="{TW_TOOLBAR_BTN} {session.commands.redo?.disabled ? TW_TOOLBAR_BTN_DISABLED : TW_TOOLBAR_BTN_HOVER}"
						onmousedown={(e) => handle_btn_mousedown(e, session.commands.redo)}
						title="Redo (⌘⇧Z)"
					>
						<svg class="size-4" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12.8621 12C11.578 13.5285 9.65242 14.5 7.49995 14.5C3.63395 14.5 0.499947 11.366 0.499947 7.5C0.499947 3.63401 3.634 0.5 7.49999 0.5C9.49999 0.5 11.25 1.75 12.5 3" stroke="currentColor" stroke-linecap="round"></path>
							<path d="M15 1.20711C15 0.761654 14.4614 0.538571 14.1464 0.853553L10.3536 4.64645C10.0386 4.96143 10.2617 5.5 10.7071 5.5H14.5C14.7761 5.5 15 5.27614 15 5V1.20711Z" fill="currentColor"></path>
						</svg>
					</button>
				</div>

				<div class="flex items-center gap-1 pointer-events-none">
					{#if cancel_command && !cancel_command.disabled}
						<button
							class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold cursor-pointer pointer-events-auto rounded-full text-(--foreground) bg-(--background) border border-[color:color-mix(in_oklch,var(--foreground)_18%,transparent)] shadow-md transition-all duration-150 hover:bg-[color:color-mix(in_oklch,var(--foreground)_10%,var(--background))] hover:border-[color:color-mix(in_oklch,var(--foreground)_28%,transparent)] active:bg-[color:color-mix(in_oklch,var(--foreground)_16%,var(--background))] active:border-[color:color-mix(in_oklch,var(--foreground)_36%,transparent)] active:scale-95 active:translate-y-px"
							onclick={() => cancel_command.execute()}
							title="Cancel (⌘⎋ / Ctrl+Esc)"
						>
							{cancel_button_label}
						</button>
					{/if}

					{#if !app_commands.save_document.disabled}
						<button
							class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold cursor-pointer pointer-events-auto rounded-full text-(--svedit-editing-stroke) bg-(--background) border border-(--svedit-editing-stroke) shadow-md transition-all duration-150 hover:bg-[color:color-mix(in_oklch,var(--foreground)_10%,var(--background))] hover:border-(--svedit-editing-stroke) active:bg-[color:color-mix(in_oklch,var(--foreground)_16%,var(--background))] active:border-(--svedit-editing-stroke) active:scale-95 active:translate-y-px"
							onclick={() => app_commands.save_document.execute()}
							title="Save (⌘S)"
						>
							Save
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
